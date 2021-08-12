import { SyncRequest } from '@botpress/messaging-base'
import { Router } from 'express'
import _ from 'lodash'
import { BaseApi } from '../base/api'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { ConfigService } from '../config/service'
import { makeSyncRequestSchema } from './schema'
import { SyncService } from './service'

export class SyncApi extends BaseApi {
  constructor(
    router: Router,
    private config: ConfigService,
    private syncs: SyncService,
    private clients: ClientService,
    private channels: ChannelService
  ) {
    super(router)
  }

  async setup() {
    // TODO: kind of a hack to make spinning with boptress work
    const force = (process.env.INTERNAL_PASSWORD || this.config.current.security?.password)?.length > 0

    const requestSchema = makeSyncRequestSchema(this.channels.list())

    this.router.post(
      '/sync',
      this.asyncMiddleware(async (req, res) => {
        const channelsWithoutEnabled: { [channelName: string]: any } = {}
        for (const [channelName, channelConfig] of Object.entries<any>(req.body?.channels || {})) {
          if (channelConfig.enabled === false) {
            continue
          }

          channelsWithoutEnabled[channelName] = _.omit(channelConfig, ['enabled'])
        }
        const bodyWithoutEnabled = { ...(req.body || {}), channels: channelsWithoutEnabled }

        const { error, value } = requestSchema.validate(bodyWithoutEnabled)
        if (error) {
          return res.status(400).send(error.message)
        }

        const sync = value as SyncRequest

        // We forbid sync requests that act on existing clients (valid clientId) but don't provide the correct token
        // A sync request will accept a incorrect client id (we assume the client was deleted a provide a new client id in response)
        // A sync request will also accept no client id (we assume the caller wants a new client id and we send it as a response)
        if (sync.id) {
          const client = await this.clients.getById(sync.id)
          if (client && (!sync.token || !(await this.clients.getByIdAndToken(sync.id, sync.token)))) {
            return res.sendStatus(403)
          }
        }

        const result = await this.syncs.sync(sync, { name: force })

        res.send(result)
      })
    )
  }
}
