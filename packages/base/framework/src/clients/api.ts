import { uuid } from '@botpress/messaging-base'
import { Logger, LoggerLevel } from '@botpress/messaging-engine'
import clc from 'cli-color'
import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { AdminApiManager } from '../base/api-manager'
import { ClientTokenService } from '../client-tokens/service'
import { Schema } from './schema'
import { ClientService } from './service'

export class ClientApi {
  constructor(private clients: ClientService, private clientTokens: ClientTokenService) {}

  setup(router: AdminApiManager) {
    if (!process.env.ADMIN_KEY) {
      new Logger('Admin').window(
        [clc.redBright('ADMIN_KEY IS NOT SET'), 'ADMIN ROUTES ARE UNPROTECTED'],
        LoggerLevel.Critical,
        75
      )
    }

    router.post('/admin/clients', Schema.Api.Create, this.create.bind(this))
  }

  async create(req: Request, res: Response) {
    let clientId: uuid | undefined = req.body.id

    if (clientId && (await this.clients.fetchById(clientId))) {
      return res.status(403).send(`client with id "${clientId}" already exists`)
    }

    if (!clientId) {
      clientId = uuidv4()
    }

    const client = await this.clients.create(clientId)
    const rawToken = await this.clientTokens.generateToken()
    const clientToken = await this.clientTokens.create(client.id, rawToken, undefined)

    res.status(201).send({ id: client.id, token: `${clientToken.id}.${rawToken}` })
  }
}
