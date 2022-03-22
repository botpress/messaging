import { uuid } from '@botpress/messaging-base'
import { Logger, LoggerLevel } from '@botpress/messaging-engine'
import clc from 'cli-color'
import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { AdminApiManager, ApiManager } from '../base/api-manager'
import { ClientTokenService } from '../client-tokens/service'
import { ProviderService } from '../providers/service'
import { ProvisionService } from '../provisions/service'
import { Schema } from './schema'
import { ClientService } from './service'

export class ClientApi {
  constructor(
    private providers: ProviderService,
    private clients: ClientService,
    private clientTokens: ClientTokenService,
    private provisions: ProvisionService
  ) {}

  setup(pub: ApiManager, router: AdminApiManager) {
    if (!process.env.ADMIN_KEY) {
      new Logger('Admin').window(
        [clc.redBright('ADMIN_KEY IS NOT SET'), 'ADMIN ROUTES ARE UNPROTECTED'],
        LoggerLevel.Critical,
        75
      )
    }

    pub.get('/clients', Schema.Api.Get, this.get.bind(this))
    router.post('/admin/clients', Schema.Api.Create, this.create.bind(this))
    router.put('/admin/clients/name', Schema.Api.Name, this.rename.bind(this))
  }

  async get(req: Request, res: Response) {
    res.sendStatus(200)
  }

  async create(req: Request, res: Response) {
    let clientId: uuid | undefined = req.body.id

    if (clientId && (await this.clients.fetchById(clientId))) {
      return res.status(403).send(`client with id "${clientId}" already exists`)
    }

    if (!clientId) {
      clientId = uuidv4()
    }

    const provider = await this.providers.create(clientId, false)
    const client = await this.clients.create(clientId)
    await this.provisions.create(client.id, provider.id)

    const rawToken = await this.clientTokens.generateToken()
    const clientToken = await this.clientTokens.create(client.id, rawToken, undefined)

    res.status(201).send({ id: client.id, token: `${clientToken.id}.${rawToken}` })
  }

  async rename(req: Request, res: Response) {
    const name = req.body.name as string
    const clientId = req.body.id as string

    const client = this.clients.fetchById(clientId)
    if (!client) {
      return res.status(404).send(`client "${clientId}" does not exist`)
    }

    const provision = await this.provisions.getByClientId(clientId)
    const provider = await this.providers.getById(provision.providerId)
    if (provider.name === name) {
      return res.sendStatus(204)
    }

    const providerWithSameName = await this.providers.fetchByName(name)
    if (providerWithSameName) {
      // we delete any provider with conflicting name
      const provision = await this.provisions.fetchByProviderId(providerWithSameName.id)
      await this.providers.delete(providerWithSameName.id)

      if (provision) {
        // if the provider had a provision associated to it, we create a new one to not let a clientId with no provision
        const newProvider = await this.providers.create(provision.clientId, false)
        await this.provisions.create(provision.clientId, newProvider.id)
      }
    }

    await this.providers.updateName(provider.id, name)

    res.sendStatus(200)
  }
}
