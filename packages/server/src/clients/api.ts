import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { AdminApiManager } from '../base/api-manager'
import { ClientTokenService } from '../client-tokens/service'
import { ProviderService } from '../providers/service'
import { Schema } from './schema'
import { ClientService } from './service'

export class ClientApi {
  constructor(
    private providers: ProviderService,
    private clients: ClientService,
    private clientTokens: ClientTokenService
  ) {}

  setup(router: AdminApiManager) {
    router.post('/admin/clients', Schema.Api.Create, this.create.bind(this))
  }

  async create(req: Request, res: Response) {
    const clientId = uuidv4()

    const provider = await this.providers.create(clientId, false)
    const client = await this.clients.create(provider.id, clientId)

    const rawToken = await this.clientTokens.generateToken()
    const clientToken = await this.clientTokens.create(client.id, rawToken, undefined)

    res.status(201).send({ id: client.id, token: `${clientToken.id}.${rawToken}` })
  }
}
