import express, { Router } from 'express'
import { Service } from '../base/service'
import { ConfigService } from '../config/service'
import { ConversationService } from '../conversations/service'
import { KvsService } from '../kvs/service'
import { MessageService } from '../messages/service'
import { Channel } from './base/channel'
import { ChannelConfig } from './base/config'
import { SlackChannel } from './slack/channel'
import { TelegramChannel } from './telegram/channel'
import { TwilioChannel } from './twilio/channel'
import { Routers } from './types'

export class ChannelService extends Service {
  private channels: Channel[]
  private routers: Routers

  constructor(
    private configService: ConfigService,
    private kvsService: KvsService,
    private conversationService: ConversationService,
    private messagesService: MessageService,
    router: Router
  ) {
    super()
    this.channels = [new TwilioChannel(), new TelegramChannel(), new SlackChannel()]

    const fullRouter = Router()
    fullRouter.use(express.json())
    fullRouter.use(express.urlencoded({ extended: true }))

    this.routers = {
      full: fullRouter,
      raw: router
    }
  }

  async setup() {
    for (const channel of this.channels) {
      const config = this.getConfig(channel.id)
      if (config.enabled) {
        await channel.setup(config, this.kvsService, this.conversationService, this.messagesService, this.routers)
      }
    }
  }

  list() {
    return this.channels
  }

  get(channelId: string) {
    return this.channels.find((x) => x.id === channelId)
  }

  getConfig(channelId: string): ChannelConfig {
    return {
      ...(this.configService.current.channels?.[channelId] || {}),
      externalUrl: this.configService.current.externalUrl
    }
  }
}
