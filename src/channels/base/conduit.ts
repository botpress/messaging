import axios from 'axios'
import _ from 'lodash'
import { validate as uuidValidate } from 'uuid'
import { App } from '../../app'
import { uuid } from '../../base/types'
import { Logger } from '../../logger/types'
import { Endpoint, Mapping } from '../../mapping/types'
import { Channel } from './channel'
import { ChannelConfig } from './config'
import { ChannelContext } from './context'
import { ChannelRenderer } from './renderer'
import { ChannelSender } from './sender'

export abstract class ConduitInstance<TConfig extends ChannelConfig, TContext extends ChannelContext<any>> {
  protected app!: App
  public config!: TConfig
  protected channel!: Channel<any>
  protected providerName!: string
  protected clientId?: uuid
  protected sandbox!: boolean

  protected renderers!: ChannelRenderer<TContext>[]
  protected senders!: ChannelSender<TContext>[]
  protected logger!: Logger
  protected loggerIn!: Logger
  protected loggerOut!: Logger

  async setup(
    app: App,
    config: TConfig,
    channel: Channel<any>,
    providerName: string,
    clientId: string | undefined,
    sandbox: boolean
  ): Promise<void> {
    this.app = app
    this.config = config
    this.channel = channel
    this.providerName = providerName
    this.clientId = clientId
    this.sandbox = sandbox

    this.logger = this.app.logger.root.sub(this.channel.name)
    this.loggerIn = this.logger.sub('incoming')
    this.loggerOut = this.logger.sub('outgoing')

    await this.setupConnection()
    this.renderers = this.setupRenderers().sort((a, b) => a.priority - b.priority)
    this.senders = this.setupSenders().sort((a, b) => a.priority - b.priority)
  }

  async receive(payload: any) {
    const endpoint = await this.map(payload)

    let clientId = this.clientId!

    if (this.sandbox) {
      const provider = await this.app.providers.getByName(this.providerName)
      const conduit = await this.app.conduits.get(provider!.id, this.channel.id)

      const sandboxmap = await this.app.mapping.sandboxmap.get(
        conduit!.id,
        endpoint.foreignAppId || '*',
        endpoint.foreignUserId || '*',
        endpoint.foreignConversationId || '*'
      )

      if (sandboxmap) {
        clientId = sandboxmap.clientId
      } else if (endpoint.content?.text?.startsWith('!join')) {
        const text = endpoint.content.text as string
        const passphrase = text.replace('!join ', '')
        this.logger.info('Attempting to join sandbox with passphrase', passphrase)

        if (uuidValidate(passphrase)) {
          const client = await this.app.clients.getById(passphrase)
          if (client) {
            this.logger.info('Joined sandbox!', client.id)

            await this.app.mapping.sandboxmap.create(
              conduit!.id,
              endpoint.foreignAppId || '*',
              endpoint.foreignUserId || '*',
              endpoint.foreignConversationId || '*',
              client.id
            )

            clientId = client.id
          } else {
            this.logger.info('Wrong passphrase')
            return
          }
        } else {
          this.logger.info('Wrong passphrase')
          return
        }
      } else {
        this.logger.info('This endpoint is unknown to the sandbox')
        return
      }
    }

    const tunnel = await this.app.mapping.tunnels.map(clientId, this.channel.id)
    const identity = await this.app.mapping.identities.map(tunnel.id, endpoint.foreignAppId || '*')
    const sender = await this.app.mapping.senders.map(identity.id, endpoint.foreignUserId || '*')
    const thread = await this.app.mapping.threads.map(sender.id, endpoint.foreignConversationId || '*')

    const convmap = await this.app.mapping.convmap.getByThreadId(tunnel.id, thread.id)
    let conversationId = convmap?.conversationId
    if (!conversationId) {
      conversationId = (await this.app.conversations.create(clientId, endpoint.foreignUserId!)).id
      await this.app.mapping.convmap.create(tunnel.id, conversationId, thread.id)
    }

    const message = await this.app.messages.create(conversationId, endpoint.content, endpoint.foreignUserId)

    const post = {
      client: { id: clientId },
      channel: { id: this.channel.id, name: this.channel.name },
      user: { id: endpoint.foreignUserId },
      conversation: { id: conversationId },
      message
    }
    this.loggerIn.debug('Received message', post)

    const webhooks = await this.app.webhooks.list(clientId)
    for (const webhook of webhooks) {
      await axios.post(webhook.url, post)
    }
  }

  async send(conversationId: string, payload: any): Promise<void> {
    const conversation = await this.app.conversations.get(conversationId)

    const tunnel = await this.app.mapping.tunnels.map(conversation!.clientId, this.channel.id)
    const convmap = await this.app.mapping.convmap.getByConversationId(tunnel.id, conversationId)

    const thread = await this.app.mapping.threads.get(convmap!.threadId)
    const sender = await this.app.mapping.senders.get(thread!.senderId)
    const identity = await this.app.mapping.identities.get(sender!.identityId)

    const mapping: Mapping = {
      foreignAppId: identity?.name,
      foreignConversationId: thread?.name,
      foreignUserId: sender?.name,
      clientId: conversation!.clientId,
      channelId: this.channel.id,
      conversationId
    }

    const context = await this.context({
      client: undefined,
      handlers: 0,
      payload: _.cloneDeep(payload),
      // TODO: bot url
      botUrl: 'https://duckduckgo.com/',
      logger: this.logger,
      ...mapping
    })

    for (const renderer of this.renderers) {
      if (renderer.handles(context)) {
        renderer.render(context)
        context.handlers++
      }
    }

    for (const sender of this.senders) {
      if (sender.handles(context)) {
        await sender.send(context)
      }
    }

    const message = await this.app.messages.create(conversationId, payload, mapping.foreignUserId)
    this.loggerOut.debug('Sending message', {
      providerName: this.providerName,
      clientId: conversation!.clientId,
      message
    })
  }

  async initialize() {}

  async destroy() {}

  protected abstract setupConnection(): Promise<void>
  protected abstract setupRenderers(): ChannelRenderer<TContext>[]
  protected abstract setupSenders(): ChannelSender<TContext>[]
  protected abstract map(payload: any): Promise<EndpointContent>
  protected abstract context(base: ChannelContext<any>): Promise<TContext>
}

export type EndpointContent = {
  content: any
} & Endpoint
