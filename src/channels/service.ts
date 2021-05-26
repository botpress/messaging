import { Router } from 'express'
import { Service } from '../base/service'
import { ConfigService } from '../config/service'
import { ConversationService } from '../conversations/service'
import { KvsService } from '../kvs/service'
import { LoggerService } from '../logger/service'
import { MappingService } from '../mapping/service'
import { MessageService } from '../messages/service'
import { ProviderService } from '../providers/service'
import { Channel } from './base/channel'
import { MessengerChannel } from './messenger/channel'
import { SlackChannel } from './slack/channel'
import { ChannelSmooch as SmoochChannel } from './smooch/channel'
import { TeamsChannel } from './teams/channel'
import { TelegramChannel } from './telegram/channel'
import { TwilioChannel } from './twilio/channel'
import { VonageChannel } from './vonage/channel'

export class ChannelService extends Service {
  private channels: { [providerId: string]: Channel<any, any>[] } = {}

  constructor(
    private configService: ConfigService,
    private providerService: ProviderService,
    private kvsService: KvsService,
    private conversationService: ConversationService,
    private messagesService: MessageService,
    private mappingService: MappingService,
    private loggerService: LoggerService,
    private router: Router
  ) {
    super()
  }

  async setup() {
    const types = [
      MessengerChannel,
      TwilioChannel,
      TelegramChannel,
      SlackChannel,
      TeamsChannel,
      SmoochChannel,
      VonageChannel
    ]

    for (const provider of this.providerService.list()) {
      this.channels[provider.name] = []

      for (const ChannelType of types) {
        const channel = new ChannelType(
          provider.name,
          provider.client?.id,
          this.kvsService,
          this.conversationService,
          this.messagesService,
          this.mappingService,
          this.loggerService,
          this.router
        )

        const config = {
          ...provider.channels[channel.id],
          externalUrl: this.configService.current.externalUrl
        }

        if (config.enabled) {
          await channel.setup(config)
        }

        this.channels[provider.name].push(channel)
      }
    }
  }

  get(providerId: string, channelId: string) {
    return this.channels[providerId].find((x) => x.id === channelId)
  }

  list() {
    return this.channels
  }
}
