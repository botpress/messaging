import { Engine, Migration } from '@botpress/messaging-engine'
import { ServerMetadata } from '@botpress/messaging-engine/src/meta/types'
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

  async setup() {
    await super.setup()
    await this.clients.setup()
    await this.clientTokens.setup()
  }

  async prepare(pkg: ServerMetadata, migs: { new (): Migration }[]) {
    this.meta.prepare(pkg)
    this.migration.prepare(migs)
  }

  async monitor() {}
}
