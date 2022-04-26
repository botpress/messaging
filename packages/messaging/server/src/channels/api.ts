import { Channel, Endpoint, ProactiveEvent, MessageEvent } from '@botpress/messaging-channels'
import { Router } from 'express'
import { App } from '../app'
import { Mapping } from '../mapping/types'

export class ChannelApi {
  private routers: { [version: string]: { router: Router; path: string } } = {}

  constructor(private router: Router, private app: App) {}

  async setup() {
    this.createVersionRouter('0.1.0', '')
    this.createVersionRouter('1.0.0', '/v1')
    await this.setupChannels()
  }

  private createVersionRouter(version: string, path: string) {
    const router = Router()

    this.routers[version] = {
      router,
      path
    }
    this.router.use(`/webhooks${path}`, router)
  }

  private async setupChannels() {
    const baseUrl = `${process.env.EXTERNAL_URL}/webhooks`

    for (const channel of this.app.channels.list()) {
      const { router, path } = this.routers[channel.meta.version]

      channel.makeUrl(async (scope: string) => `${baseUrl}${path}/${scope}/${channel.meta.name}`)
      channel.on('message', async (e) => this.handleChannelMessage(channel, e))
      channel.on('proactive', async (e) => this.handleChannelProactive(channel, e))

      await channel.setup(router)
    }
  }

  private async handleChannelMessage(channel: Channel, event: MessageEvent) {
    const { scope, endpoint, content } = event

    if (!content.type) {
      return
    }

    const mapping = await this.map(channel, scope, endpoint, content)
    if (!mapping) {
      return
    }

    await this.app.messages.create(mapping.conversationId, mapping.userId, content, {
      endpoint
    })
  }

  private async handleChannelProactive(channel: Channel, event: ProactiveEvent) {
    const { scope, endpoint } = event

    const mapping = await this.map(channel, scope, endpoint, {})
    if (!mapping) {
      return
    }

    await this.app.conversations.start(mapping.conversationId)
  }

  private async map(channel: Channel, scope: string, endpoint: Endpoint, content: any): Promise<Mapping | undefined> {
    const provider = await this.app.providers.getByName(scope)
    const conduit = await this.app.conduits.getByProviderAndChannel(provider.id, channel.meta.id)

    const clientId = provider.sandbox
      ? await this.app.instances.sandbox.getClientId(conduit.id, endpoint, content)
      : (await this.app.provisions.getByProviderId(provider.id)).clientId

    if (!clientId) {
      return undefined
    }

    return this.app.mapping.getMapping(clientId, channel.meta.id, endpoint)
  }
}
