import { Router } from 'express'
import { App } from '../app'

export class ChannelApi {
  constructor(private router: Router, private app: App) {}

  async setup() {
    const webhookRouter = Router()

    for (const channel of this.app.channels.list()) {
      await channel.setup(webhookRouter)

      channel.api.makeUrl(async (scope: string) => {
        return `${process.env.EXTERNAL_URL}/webhooks/${scope}/${channel.meta.name}`
      })

      channel.on('message', async ({ scope, endpoint, content }) => {
        const provider = await this.app.providers.getByName(scope)
        const conduit = await this.app.conduits.getByProviderAndChannel(provider!.id, channel.meta.id)

        if (!content.type) {
          return
        }

        const clientId = provider!.sandbox
          ? await this.app.instances.sandbox.getClientId(conduit!.id, endpoint, content)
          : (await this.app.clients.getByProviderId(provider!.id))!.id

        if (!clientId) {
          return
        }

        const { userId, conversationId } = await this.app.mapping.getMapping(clientId, channel.meta.id, endpoint)

        await this.app.messages.create(conversationId, userId, content, {
          conduit: { id: conduit!.id, endpoint }
        })
      })
    }

    this.router.use('/webhooks', webhookRouter)
  }
}
