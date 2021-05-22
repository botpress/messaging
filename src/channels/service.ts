import { Router } from 'express'
import { Service } from '../base/service'
import { ConfigService } from '../config/service'
import { ConversationService } from '../conversations/service'
import { KvsService } from '../kvs/service'
import { LoggerService } from '../logger/service'
import { MappingService } from '../mapping/service'
import { MessageService } from '../messages/service'
import { Channel } from './base/channel'
import { ChannelConfig } from './base/config'
import { SlackChannel } from './slack/channel'
import { ChannelSmooch as SmoochChannel } from './smooch/channel'
import { TeamsChannel } from './teams/channel'
import { TelegramChannel } from './telegram/channel'
import { TwilioChannel } from './twilio/channel'

export class ChannelService extends Service {
  private channels: Channel<any, any>[]

  constructor(
    private configService: ConfigService,
    kvsService: KvsService,
    conversationService: ConversationService,
    messagesService: MessageService,
    mappingService: MappingService,
    loggerService: LoggerService,
    router: Router
  ) {
    super()

    const types = [TwilioChannel, TelegramChannel, SlackChannel, TeamsChannel, SmoochChannel]

    this.channels = types.map(
      (Channel) => new Channel(kvsService, conversationService, messagesService, mappingService, loggerService, router)
    )
  }

  async setup() {
    for (const channel of this.channels) {
      const config = this.getConfig(channel.id)
      if (config.enabled) {
        channel.config = config
        await channel.setup()
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
