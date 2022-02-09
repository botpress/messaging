import { uuid } from '@botpress/messaging-base'
import { DistributedService, Logger, LoggerLevel } from '@botpress/messaging-engine'
import clc from 'cli-color'
import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { AdminApiManager } from '../base/api-manager'
import { ClientTokenService } from '../client-tokens/service'
import { ProviderService } from '../providers/service'
import { Provider } from '../providers/types'
import { Schema } from './schema'
import { ClientService } from './service'
import { Client } from './types'

export class ClientApi {
  constructor(
    private distributed: DistributedService,
    private providers: ProviderService,
    private clients: ClientService,
    private clientTokens: ClientTokenService
  ) {}

  setup(router: AdminApiManager) {
    if (!process.env.ADMIN_KEY) {
      new Logger('Admin').window(
        [clc.redBright('ADMIN_KEY IS NOT SET'), 'ADMIN ROUTES ARE UNPROTECTED'],
        LoggerLevel.Critical,
        75
      )
    }

    router.post('/admin/clients', Schema.Api.Create, this.create.bind(this))
    router.post('/admin/clients/sync', Schema.Api.Sync, this.sync.bind(this))
  }

  async create(req: Request, res: Response) {
    const clientId: uuid = req.body.id

    if (clientId && (await this.clients.getById(clientId))) {
      return res.status(403).send(`client with id "${clientId}" already exists`)
    }

    const provider = await this.providers.create(clientId || uuidv4(), false)
    const client = await this.clients.create(provider.id, clientId)

    const rawToken = await this.clientTokens.generateToken()
    const clientToken = await this.clientTokens.create(client.id, rawToken, undefined)

    res.status(201).send({ id: client.id, token: `${clientToken.id}.${rawToken}` })
  }

  async sync(req: Request, res: Response) {
    this.distributed.using(`lock_dyn_admin_client_sync::${req.body.name}`, async () => {
      await this.syncClient(req, res)
    })
  }

  async syncClient(req: Request, res: Response) {
    const sync = { id: req.body.id, token: req.body.token, name: req.body.name } as {
      id?: uuid
      token?: string
      name: string
    }

    let client: Client | undefined = undefined
    let token: string | undefined = undefined
    let provider: Provider | undefined = undefined

    if (sync.id) {
      client = await this.clients.fetchById(sync.id)
      if (client) {
        token = sync.token
      }
    }

    if (!client) {
      const exisingProvider = await this.providers.fetchByName(sync.name)
      if (exisingProvider) {
        const existingClient = await this.clients.fetchByProviderId(exisingProvider.id)
        if (existingClient) {
          client = await this.clients.getById(existingClient.id)
        }
      }
    }

    if (!client) {
      provider = await this.providers.create(sync.name, false)
      client = await this.clients.create(provider.id)
    } else {
      provider = await this.providers.fetchById(client.providerId)

      if (!provider) {
        provider = await this.providers.create(sync.name, false)

        await this.clients.updateProvider(client.id, provider.id)
        client = await this.clients.getById(client.id)
      }
    }

    if (!token || !(await this.clientTokens.verifyToken(client.id, token))) {
      const rawToken = await this.clientTokens.generateToken()
      const clientToken = await this.clientTokens.create(client.id, rawToken, undefined)
      token = `${clientToken.id}.${rawToken}`
    }

    if (provider.name !== sync.name) {
      const providerWithSameName = await this.providers.fetchByName(sync.name)
      if (providerWithSameName && providerWithSameName.id !== provider.id) {
        await this.providers.delete(providerWithSameName.id)
      }

      await this.providers.updateName(provider.id, sync.name)
    }

    res.status(200).send({ id: client.id, token })
  }
}
