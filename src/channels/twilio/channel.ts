import { Router } from 'express'
import { ConversationService } from '../../conversations/service'
import { KvsService } from '../../kvs/service'
import { MessageService } from '../../messages/service'
import { Channel } from '../base/channel'
import { Routers } from '../types'
import { TwilioClient } from './client'
import { TwilioConfig } from './config'
import { TwilioRouter } from './router'

export class TwilioChannel extends Channel {
  private client!: TwilioClient
  private router!: TwilioRouter

  get id() {
    return 'twilio'
  }

  async setup(
    config: TwilioConfig,
    kvsService: KvsService,
    conversationService: ConversationService,
    messagesService: MessageService,
    routers: Routers
  ) {
    this.client = new TwilioClient(config, kvsService, conversationService, messagesService)
    this.client.setup()

    this.router = new TwilioRouter(config, routers, this.client)
    this.router.setup()
  }

  async send(conversationId: string, payload: any) {
    return this.client.send(conversationId, payload)
  }
}
