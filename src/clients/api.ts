import { Router } from 'express'
import { BaseApi } from '../base/api'
import { ChannelService } from '../channels/service'
import { ConduitService } from '../conduits/service'
import { ProviderService } from '../providers/service'
import { ClientService } from './service'
import { Client } from './types'

export class ClientApi extends BaseApi {
  constructor(
    router: Router,
    private channels: ChannelService,
    private providers: ProviderService,
    private conduits: ConduitService,
    private clients: ClientService
  ) {
    super(router)
  }

  async setup() {
    this.router.post('/clients', async (req, res) => {
      const { providerId } = req.body

      const token = await this.clients.generateToken()
      const client = await this.clients.create(providerId, token)

      res.send({ id: client.id, token })
    })

    this.router.post('/clients/setup', async (req, res) => {
      const { name, clientId, conduits } = req.body

      let provider = await this.providers.getByName(name)
      if (!provider) {
        provider = await this.providers.create(undefined, name)
      }

      for (const [channel, config] of Object.entries(conduits)) {
        const channelId = this.channels.getByName(channel).id
        const conduit = await this.conduits.get(provider.id, channelId)

        if (conduit) {
          await this.conduits.updateConfig(provider.id, channelId, config)
        } else {
          await this.conduits.create(provider.id, channelId, config)
        }
      }

      let client: Client | undefined = undefined
      let token: string | undefined = undefined

      if (clientId) {
        client = await this.clients.getById(clientId)
      }

      if (!client) {
        await this.clients.unlinkAllFromProvider(provider.id)
        token = await this.clients.generateToken()
        client = await this.clients.create(provider.id, token)
      } else if (client.providerId !== provider.id) {
        await this.clients.updateProvider(clientId, provider.id)
      }

      const result = { clientId: client?.id, clientToken: token, providerName: provider?.name }
      res.send(result)
    })
  }
}
