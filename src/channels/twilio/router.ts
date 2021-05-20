import { Router } from 'express'
import { validateRequest } from 'twilio'
import { Routers } from '../types'
import { TwilioClient } from './client'
import { TwilioConfig } from './config'

export class TwilioRouter {
  private webhookUrl!: string

  constructor(private config: TwilioConfig, private routers: Routers, private client: TwilioClient) {}

  setup() {
    const route = '/webhooks/twilio'

    this.routers.full.post(route, async (req, res) => {
      if (this.auth(req)) {
        await this.client.receive(req.body)
        res.sendStatus(204)
      } else {
        res.status(401).send('Auth token invalid')
      }
    })

    this.webhookUrl = this.config.externalUrl + route

    console.log(`Twilio webhook listening at ${this.webhookUrl}`)
  }

  private auth(req: any): boolean {
    const signature = req.headers['x-twilio-signature']
    return validateRequest(this.config.authToken!, signature, this.webhookUrl, req.body)
  }
}
