import express, { Response } from 'express'
import { validateRequest } from 'twilio'
import yn from 'yn'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { TwilioService } from './service'

export class TwilioApi extends ChannelApi<TwilioService> {
  async setup(router: ChannelApiManager) {
    router.use('/twilio', express.urlencoded({ extended: true }))
    router.post('/twilio', this.handleRequest.bind(this))

    this.service.on('start', this.handleStart.bind(this))
  }

  private async handleStart({ scope }: { scope: string }) {
    await this.printWebhook(scope, 'twilio')
  }

  private async handleRequest(req: ChannelApiRequest, res: Response) {
    const signature = req.headers['x-twilio-signature'] as string
    const { config } = this.service.get(req.scope)
    const webhookUrl = await this.urlCallback!(req.scope)

    if (yn(process.env.TWILIO_TESTING)) {
      await this.receive(req.scope, req.body)
      res.sendStatus(200)
    } else if (validateRequest(config.authToken, signature, webhookUrl, req.body)) {
      await this.receive(req.scope, req.body)
      res.sendStatus(204)
    } else {
      res.sendStatus(401)
    }
  }

  private async receive(scope: string, body: any) {
    const botPhoneNumber = body.To
    const userPhoneNumber = body.From

    const index = Number(body.Body)
    const content = this.service.handleIndexResponse(scope, index, botPhoneNumber, userPhoneNumber) || {
      type: 'text',
      text: body.Body
    }

    await this.service.receive(scope, { identity: botPhoneNumber, sender: userPhoneNumber, thread: '*' }, content)
  }
}
