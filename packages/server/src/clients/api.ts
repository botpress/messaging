import { uuid } from '@botpress/messaging-base'
import { Logger, LoggerLevel } from '@botpress/messaging-engine'
import { AdminApiManager, ApiManager, ClientTokenService } from '@botpress/messaging-framework'
import clc from 'cli-color'
import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { ProviderService } from '../providers/service'
import { ProvisionService } from '../provisions/service'
import { Schema } from './schema'

export class ClientApi {
  constructor(
    private providers: ProviderService,
    private clients: ClientService,
    private provisions: ProvisionService
  ) {}

  setup(pub: ApiManager, router: AdminApiManager) {
    pub.get('/clients', Schema.Api.Get, this.get.bind(this))
    router.put('/admin/clients/name', Schema.Api.Name, this.rename.bind(this))
  }

  async get(req: Request, res: Response) {
    res.sendStatus(200)
  }

  async rename(req: Request, res: Response) {
    const name = req.body.name as string
    const clientId = req.body.id as string

    const client = this.clients.fetchById(clientId)
    if (!client) {
      return res.status(404).send(`client "${clientId}" does not exist`)
    }

    let provision = await this.provisions.fetchByClientId(clientId)
    if (!provision) {
      const provider = await this.providers.create(clientId, false)
      provision = await this.provisions.create(clientId, provider.id)
    }

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
