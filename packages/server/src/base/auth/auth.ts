import { ClientTokenService } from '../../client-tokens/service'
import { AdminAuthHandler } from './admin'
import { ClientAuthHandler } from './client'
import { PublicAuthHandler } from './public'

export class Auth {
  public readonly admin: AdminAuthHandler
  public readonly client: ClientAuthHandler
  public readonly public: PublicAuthHandler

  constructor(clientTokens: ClientTokenService) {
    this.admin = new AdminAuthHandler()
    this.client = new ClientAuthHandler(clientTokens)
    this.public = new PublicAuthHandler()
  }
}
