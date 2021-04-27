import { Router } from 'express'
import { Channel } from '../base/channel'
import { TwilioClient } from './client'
import { TwilioConfig } from './config'
import { TwilioRouter } from './router'

export class TwilioChannel extends Channel {
  private client!: TwilioClient
  private router!: TwilioRouter

  get id() {
    return 'twilio'
  }

  setup(config: TwilioConfig, router: Router) {
    this.client = new TwilioClient(config)
    this.client.setup()

    this.router = new TwilioRouter(config, router, this.client)
    this.router.setup()
  }

  async send(conversationId: string, payload: any) {
    return this.client.send(conversationId, payload)
  }
}
