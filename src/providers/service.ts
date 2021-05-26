import { Service } from '../base/service'
import { Client, ClientService } from '../clients/service'
import { ConfigService } from '../config/service'

export class ProviderService extends Service {
  private providers!: Provider[]

  constructor(private configService: ConfigService, private clientService: ClientService) {
    super()
  }

  async setup() {
    this.providers = []

    for (const config of this.configService.current.providers) {
      this.providers.push({
        name: config.name,
        client: config.client
          ? (await this.clientService.get(config.client?.token)) ??
            (await this.clientService.create(config.name, config.client?.token))
          : undefined,
        channels: config.channels
      })
    }
  }

  list() {
    return this.providers
  }
}

export interface Provider {
  name: string
  client?: Client
  channels: any
}
