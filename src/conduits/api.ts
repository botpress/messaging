import express, { Router } from 'express'
import { ChannelService } from '../channels/service'
import { ProviderService } from '../providers/service'
import { ConduitService } from './service'

export class ConduitApi {
  constructor(
    private router: Router,
    private channels: ChannelService,
    private providers: ProviderService,
    private conduits: ConduitService
  ) {}

  async setup() {
    this.router.use('/conduits', express.json())

    this.router.post('/conduits', async (req, res) => {
      const { providerId, channel, config } = req.body

      const conduit = await this.conduits.create(providerId, this.channels.getByName(channel).id, config)

      res.send(conduit)
    })
  }
}
