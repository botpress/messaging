import { Service } from '../base/service'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { ConduitService } from '../conduits/service'
import { ProviderService } from '../providers/service'

export class HealthService extends Service {
  constructor(
    private channelService: ChannelService,
    private providerService: ProviderService,
    private clientService: ClientService,
    private conduitService: ConduitService
  ) {
    super()
  }

  async setup() {}

  async getHealth(clientId: string) {
    const client = await this.clientService.getById(clientId)
    const provider = await this.providerService.getById(client!.providerId)
    const conduits = await this.conduitService.listByProvider(provider!.id)

    const channels: any = {}

    for (const conduit of conduits) {
      const channel = this.channelService.getById(conduit.channelId)
      channels[channel.name] = { initialized: conduit.initialized }
    }

    return {
      channels
    }
  }
}
