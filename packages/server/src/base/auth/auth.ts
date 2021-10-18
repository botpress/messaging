import { ClientService } from '../../clients/service'
import { ClientAuthHandler } from './client'
import { PublicAuthHandler } from './public'

export class Auth {
  public readonly client: ClientAuthHandler
  public readonly public: PublicAuthHandler

  constructor(clients: ClientService) {
    this.client = new ClientAuthHandler(clients)
    this.public = new PublicAuthHandler()
  }
}
