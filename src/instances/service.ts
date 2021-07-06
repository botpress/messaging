import axios from 'axios'
import _ from 'lodash'
import ms from 'ms'
import { App } from '../app'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { ConduitInstance } from '../channels/base/conduit'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { ConduitService } from '../conduits/service'
import { ConfigService } from '../config/service'
import { ConversationService } from '../conversations/service'
import { MappingService } from '../mapping/service'
import { MessageService } from '../messages/service'
import { ProviderService } from '../providers/service'
import { WebhookService } from '../webhooks/service'
import { InstanceInvalidator } from './invalidator'
import { InstanceMonitoring } from './monitoring'
import { InstanceSandbox } from './sandbox'

export class InstanceService extends Service {
  private invalidator: InstanceInvalidator
  private monitoring: InstanceMonitoring
  private sandbox: InstanceSandbox
  private cache!: ServerCache<uuid, ConduitInstance<any, any>>

  constructor(
    private configService: ConfigService,
    private cachingService: CachingService,
    private channelService: ChannelService,
    private providerService: ProviderService,
    private conduitService: ConduitService,
    private clientService: ClientService,
    private webhookService: WebhookService,
    private conversationService: ConversationService,
    private messageService: MessageService,
    private mappingService: MappingService,
    private app: App
  ) {
    super()
    this.invalidator = new InstanceInvalidator(
      this.channelService,
      this.providerService,
      this.conduitService,
      this.clientService,
      this
    )
    this.monitoring = new InstanceMonitoring(this.channelService, this.conduitService, this)
    this.sandbox = new InstanceSandbox(this.clientService, this.mappingService, this)
  }

  async setup() {
    this.cache = await this.cachingService.newServerCache('cache_instance_by_conduit_id', {
      dispose: async (k, v) => {
        await v.destroy()
      },
      max: 50000,
      maxAge: ms('30min')
    })

    await this.invalidator.setup(this.cache)
    await this.monitoring.setup()
  }

  async initialize(conduitId: uuid) {
    const instance = await this.get(conduitId)
    await instance.initialize()

    await this.conduitService.updateInitialized(conduitId)
  }

  async get(conduitId: uuid): Promise<ConduitInstance<any, any>> {
    const cached = this.cache.get(conduitId)
    if (cached) {
      return cached
    }

    const conduit = (await this.conduitService.get(conduitId))!
    const config = {
      ...conduit.config,
      externalUrl: process.env.EXTERNAL_URL || this.configService.current.server?.externalUrl
    }

    const channel = this.channelService.getById(conduit.channelId)
    const instance = channel.createConduit()

    await instance.setup(conduitId, config, this.app)
    this.cache.set(conduitId, instance, channel.lazy ? undefined : Infinity)

    return instance
  }

  async send(conduitId: uuid, conversationId: uuid, payload: any): Promise<void> {
    const conduit = (await this.conduitService.get(conduitId))!
    const conversation = (await this.conversationService.get(conversationId))!

    const endpoint = await this.mappingService.getEndpoint(conversation.clientId, conduit.channelId, conversation.id)

    const instance = await this.get(conduitId)
    await instance.sendToEndpoint(endpoint, payload)

    const message = await this.messageService.create(conversationId, conversation!.userId, payload)

    instance.loggerOut.debug('Sending message', {
      clientId: conversation!.clientId,
      message
    })
  }

  async receive(conduitId: uuid, payload: any) {
    const conduit = (await this.conduitService.get(conduitId))!
    const provider = (await this.providerService.getById(conduit.providerId))!

    const instance = await this.get(conduitId)
    const endpoint = await instance.extractEndpoint(payload)

    const clientId = provider.sandbox
      ? await this.sandbox.getClientId(conduitId, endpoint)
      : (await this.clientService.getByProviderId(provider.id))!.id

    if (!clientId) {
      return
    }

    const { userId, conversationId } = await this.mappingService.getMapping(clientId, conduit.channelId, endpoint)
    const message = await this.messageService.create(conversationId, userId, endpoint.content)

    const post = {
      client: { id: clientId },
      channel: { id: conduit.channelId, name: this.channelService.getById(conduit.channelId).name },
      user: { id: userId },
      conversation: { id: conversationId },
      message
    }
    instance.loggerIn.debug('Received message', post)

    const webhooks = await this.webhookService.list(clientId)
    for (const webhook of webhooks) {
      await axios.post(webhook.url, post)
    }
  }
}
