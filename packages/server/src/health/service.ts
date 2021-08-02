import { Service } from '../base/service'
import { ClientService } from '../clients/service'
import { ConduitService } from '../conduits/service'
import { ProviderService } from '../providers/service'

export class HealthService extends Service {
  constructor(
    private providerService: ProviderService,
    private clientService: ClientService,
    private conduitService: ConduitService
  ) {
    super()
  }

  async setup() {
    // TODO: where to call this function. Should it be monitor instead?
  }

  async getHealth(clientId: string) {
    const client = await this.clientService.getById(clientId)
    const provider = await this.providerService.getById(client!.providerId)
    const conduits = await this.conduitService.listByProvider(provider!.id)

    // TODO: just returning garbage for now
    return {
      client,
      provider,
      conduits
    }
  }
}
