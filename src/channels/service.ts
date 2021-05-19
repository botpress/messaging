import { Router } from 'express'
import { Service } from '../base/service'
import { ConfigService } from '../config/service'
import { ConversationService } from '../conversations/service'
import { KvsService } from '../kvs/service'
import { MessageService } from '../messages/service'
import { Channel } from './base/channel'
import { ChannelConfig } from './base/config'
import { TwilioChannel } from './twilio/channel'

export class ChannelService extends Service {
  private channels: Channel[]

  constructor(
    private configService: ConfigService,
    private kvsService: KvsService,
    private conversationService: ConversationService,
    private messagesService: MessageService,
    private router: Router
  ) {
    super()
    this.channels = [new TwilioChannel()]
  }

  async setup() {
    for (const channel of this.channels) {
      const config = this.getConfig(channel.id)
      if (config.enabled) {
        channel.setup(config, this.kvsService, this.conversationService, this.messagesService, this.router)
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
