import { Router } from 'express'
import { Service } from '../base/service'
import { ConfigService } from '../config/service'
import { ConversationService } from '../conversations/service'
import { KvsService } from '../kvs/service'
import { LoggerService } from '../logger/service'
import { MappingService } from '../mapping/service'
import { MessageService } from '../messages/service'
import { ProviderService } from '../providers/service'
import { Instance } from './base/instance'
import { MessengerInstance } from './messenger/instance'
import { SlackInstance } from './slack/instance'
import { SmoochInstance } from './smooch/instance'
import { TeamsInstance } from './teams/instance'
import { TelegramInstance } from './telegram/instance'
import { TwilioInstance } from './twilio/instance'
import { VonageInstance } from './vonage/instance'

export class ChannelService extends Service {
  private channels: { [providerId: string]: Instance<any, any>[] } = {}

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
      MessengerInstance,
      TwilioInstance,
      TelegramInstance,
      SlackInstance,
      TeamsInstance,
      SmoochInstance,
      VonageInstance
    ]

    for (const provider of this.providerService.list()) {
      this.channels[provider.name] = []

      for (const ChannelInstanceType of types) {
        const channel = new ChannelInstanceType(
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
