import express, { Response } from 'express'
import { ChannelApiManager, ChannelApiRequest } from '../base/api'
import { TwilioService } from './service'

export class TwilioApi {
  constructor(private readonly service: TwilioService) {}

  async setup(router: ChannelApiManager) {
    router.use('/twilio', express.urlencoded({ extended: true }))
    router.post('/twilio', this.handleRequest.bind(this))
  }

  private async handleRequest(req: ChannelApiRequest, res: Response) {
    const botPhoneNumber = req.body.To
    const userPhoneNumber = req.body.From
    const content = { type: 'text', text: req.body.Body }

    await this.service.receive(req.scope, { identity: botPhoneNumber, sender: userPhoneNumber, thread: '*' }, content)

    res.sendStatus(204)
  }
}
