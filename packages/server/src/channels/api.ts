import { Channel, Endpoint } from '@botpress/messaging-channels'
import { Router } from 'express'
import { App } from '../app'
import { Mapping } from '../mapping/types'

export class ChannelApi {
  constructor(private router: Router, private app: App) {}

  async setup() {
    const logger = this.app.logger.root.sub('channels')
    const routers: { [version: string]: { router: Router; path: string } } = {
      '0.1.0': {
        router: Router(),
        path: ''
      },
      '1.0.0': {
        router: Router(),
        path: '/v1'
      }
    }

    for (const channel of this.app.channels.list()) {
      const router = routers[channel.meta.version]
      await channel.setup(router.router, logger.sub(channel.meta.name))

      channel.logger = this.app.logger.root.sub(channel.meta.name)
      channel.kvs = this.app.kvs

      channel.makeUrl(async (scope: string) => {
        return `${process.env.EXTERNAL_URL}/webhooks${router.path}/${scope}/${channel.meta.name}`
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

    this.router.use('/webhooks/v1', routers['1.0.0'].router)
    this.router.use('/webhooks', routers['0.1.0'].router)
  }

  async map(channel: Channel, scope: string, endpoint: Endpoint, content: any): Promise<Mapping | undefined> {
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
