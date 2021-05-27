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
import { Instance } from './base/instance'
import { MessengerChannel } from './messenger/channel'
import { SlackChannel } from './slack/channel'
import { SmoochChannel } from './smooch/channel'
import { TeamsChannel } from './teams/channel'
import { TelegramChannel } from './telegram/channel'
import { TwilioChannel } from './twilio/channel'
import { VonageChannel } from './vonage/channel'

export class ChannelService extends Service {
  private channels: Channel<any>[]
  private instances: { [providerId: string]: Instance<any, any>[] } = {}

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

    const types = [
      MessengerChannel,
      SlackChannel,
      TelegramChannel,
      TwilioChannel,
      SmoochChannel,
      TeamsChannel,
      VonageChannel
    ]

    this.channels = types.map(
      (x) =>
        new x(
          configService,
          providerService,
          kvsService,
          conversationService,
          messagesService,
          mappingService,
          router,
          loggerService
        )
    )
  }

  async setup() {
    for (const channel of this.channels) {
      await channel.setup()
    }
  }

  async get(providerId: string, channelId: string) {
    return this.channels.find((x) => x.name === channelId)!.getInstance(providerId)
  }

  list() {
    return this.instances
  }
}
