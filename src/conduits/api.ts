import { Router } from 'express'
import { BaseApi } from '../base/api'
import { ChannelService } from '../channels/service'
import { ProviderService } from '../providers/service'
import { ConduitService } from './service'

export class ConduitApi extends BaseApi {
  constructor(
    router: Router,
    private channels: ChannelService,
    private providers: ProviderService,
    private conduits: ConduitService
  ) {
    super(router)
  }

  async setup() {
    this.router.post('/conduits', async (req, res) => {
      const { providerId, channel, config } = req.body

      const conduit = await this.conduits.create(providerId, this.channels.getByName(channel).id, config)

      res.send(conduit)
    })
  }
}
