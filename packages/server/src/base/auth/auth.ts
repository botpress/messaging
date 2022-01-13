import { ClientTokenService } from '../../client-tokens/service'
import { ClientAuthHandler } from './client'
import { PublicAuthHandler } from './public'

export class Auth {
  public readonly client: ClientAuthHandler
  public readonly public: PublicAuthHandler

  constructor(clientTokens: ClientTokenService) {
    this.client = new ClientAuthHandler(clientTokens)
    this.public = new PublicAuthHandler()
  }
}
