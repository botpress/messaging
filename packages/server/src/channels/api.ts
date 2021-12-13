import { Channel, Endpoint } from '@botpress/messaging-channels'
import { Router } from 'express'
import { App } from '../app'
import { Mapping } from '../mapping/types'

export class ChannelApi {
  constructor(private router: Router, private app: App) {}

  async setup() {
    const webhookRouter = Router()

    for (const channel of this.app.channels.list()) {
      await channel.setup(webhookRouter)

      channel.logger = this.app.logger.root.sub(channel.meta.name)
      channel.kvs = this.app.kvs

      channel.makeUrl(async (scope: string) => {
        return `${process.env.EXTERNAL_URL}/webhooks/${scope}/${channel.meta.name}`
      })

      channel.on('message', async ({ scope, endpoint, content }) => {
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
      })

      channel.on('proactive', async ({ scope, endpoint }) => {
        const mapping = await this.map(channel, scope, endpoint, {})
        if (!mapping) {
          return
        }

        await this.app.conversations.start(mapping.conversationId)
      })
    }

    this.router.use('/webhooks', webhookRouter)
  }

  async map(channel: Channel, scope: string, endpoint: Endpoint, content: any): Promise<Mapping | undefined> {
    const provider = await this.app.providers.getByName(scope)
    const conduit = await this.app.conduits.getByProviderAndChannel(provider.id, channel.meta.id)

    const clientId = provider.sandbox
      ? await this.app.instances.sandbox.getClientId(conduit!.id, endpoint, content)
      : (await this.app.clients.getByProviderId(provider.id))!.id

    if (!clientId) {
      return undefined
    }

    return this.app.mapping.getMapping(clientId, channel.meta.id, endpoint)
  }
}
