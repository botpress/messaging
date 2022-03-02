import { Engine } from '@botpress/messaging-engine'
import { ClientTokenService } from './client-tokens/service'
import { ClientService } from './clients/service'

export class Framework extends Engine {
  clients: ClientService
  clientTokens: ClientTokenService

  constructor() {
    super()
    this.clients = new ClientService(this.database, this.caching)
    this.clientTokens = new ClientTokenService(this.database, this.crypto, this.caching)
  }

  async prepare(pkg: any, migs: any) {
    this.meta.setPkg(pkg)
    this.migration.setMigrations(migs)
  }

  async setup() {
    await super.setup()
    await this.clients.setup()
    await this.clientTokens.setup()
  }

  async destroy() {
    await this.batching?.destroy()
    await this.distributed?.destroy()
    await this.database?.destroy()
  }
}
