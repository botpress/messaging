import express, { Response } from 'express'
import { validateRequest } from 'twilio'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { TwilioService } from './service'

export class TwilioApi extends ChannelApi<TwilioService> {
  async setup(router: ChannelApiManager) {
    router.use('/twilio', express.urlencoded({ extended: true }))
    router.post('/twilio', this.handleRequest.bind(this))
  }

  private async handleRequest(req: ChannelApiRequest, res: Response) {
    const signature = req.headers['x-twilio-signature'] as string
    const { config } = this.service.get(req.scope)
    const webhookUrl = await this.urlCallback!(req.scope)

    if (validateRequest(config.authToken, signature, webhookUrl, req.body)) {
      const botPhoneNumber = req.body.To
      const userPhoneNumber = req.body.From
      const content = { type: 'text', text: req.body.Body }

      await this.service.receive(req.scope, { identity: botPhoneNumber, sender: userPhoneNumber, thread: '*' }, content)

      res.sendStatus(204)
    } else {
      res.sendStatus(401)
    }
  }
}
