import express, { Response } from 'express'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { VonageService } from './service'

export class VonageApi extends ChannelApi<VonageService> {
  async setup(router: ChannelApiManager) {
    router.use('/vonage', express.json())

    router.post('/vonage/inbound', this.handleInboundRequest.bind(this))
    router.post('/vonage/status', this.handleStatusRequest.bind(this))
  }

  private async handleInboundRequest(req: ChannelApiRequest, res: Response) {
    res.sendStatus(200)
  }

  private async handleStatusRequest(req: ChannelApiRequest, res: Response) {
    res.sendStatus(200)
  }
}
