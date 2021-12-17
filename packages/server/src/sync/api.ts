import { SyncRequest } from '@botpress/messaging-base'
import { Request, Router, Response } from 'express'
import Joi from 'joi'
import _ from 'lodash'
import yn from 'yn'
import { methodNotAllowed } from '../base/api/utils'
import { Auth } from '../base/auth/auth'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { makeSyncRequestSchema } from './schema'
import { SyncService } from './service'

export class SyncApi {
  private force!: boolean
  private schema!: Joi.ObjectSchema

  constructor(private syncs: SyncService, private clients: ClientService, private channels: ChannelService) {}

  setup(router: Router, auth: Auth) {
    this.force = !!yn(process.env.SPINNED)
    this.schema = makeSyncRequestSchema(this.channels.list())

    router
      .route('/sync')
      .post(auth.public.auth(this.sync.bind(this)))
      .all(methodNotAllowed('POST'))
  }

  async sync(req: Request, res: Response) {
    const channelsWithoutEnabled: { [channelName: string]: Object | undefined } = {}
    for (const [channelName, channelConfig] of Object.entries<typeof channelsWithoutEnabled>(
      req.body?.channels || {}
    )) {
      if (channelConfig?.enabled === false) {
        continue
      }

      channelsWithoutEnabled[channelName] = _.omit(channelConfig, ['enabled'])
    }
    const bodyWithoutEnabled = { ...(req.body || {}), channels: channelsWithoutEnabled }

    const { error, value } = this.schema.validate(bodyWithoutEnabled)
    if (error) {
      return res.status(400).send(error.message)
    }

    const sync = value as SyncRequest

    // We forbid sync requests that act on existing clients (valid clientId) but don't provide the correct token
    // A sync request will accept a incorrect client id (we assume the client was deleted a provide a new client id in response)
    // A sync request will also accept no client id (we assume the caller wants a new client id and we send it as a response)
    if (sync.id) {
      const client = await this.clients.fetchById(sync.id)
      if (client && (!sync.token || !(await this.clients.getByIdAndToken(sync.id, sync.token)))) {
        return res.sendStatus(403)
      }
    }

    const result = await this.syncs.sync(sync, { name: this.force })

    res.send(result)
  }
}
