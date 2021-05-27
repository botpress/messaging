import { Router } from 'express'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ConfigService } from '../config/service'
import { ConversationService } from '../conversations/service'
import { DatabaseService } from '../database/service'
import { KvsService } from '../kvs/service'
import { LoggerService } from '../logger/service'
import { MappingService } from '../mapping/service'
import { MessageService } from '../messages/service'
import { ProviderService } from '../providers/service'
import { Channel } from './base/channel'
import { MessengerChannel } from './messenger/channel'
import { SlackChannel } from './slack/channel'
import { SmoochChannel } from './smooch/channel'
import { TeamsChannel } from './teams/channel'
import { TelegramChannel } from './telegram/channel'
import { TwilioChannel } from './twilio/channel'
import { VonageChannel } from './vonage/channel'

export class ChannelService extends Service {
  private channels!: Channel<any>[]

  constructor(
    private db: DatabaseService,
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
      SlackChannel,
      TeamsChannel,
      TelegramChannel,
      TwilioChannel,
      SmoochChannel,
      VonageChannel
    ]

    this.channels = types.map(
      (x) =>
        new x(
          this.configService,
          this.providerService,
          this.kvsService,
          this.conversationService,
          this.messagesService,
          this.mappingService,
          this.router,
          this.loggerService
        )
    )

    await this.db.table('channels', (table) => {
      table.uuid('id').primary()
      table.string('name').unique()
    })
  }

  async setupChannels() {
    for (const channel of this.channels) {
      await channel.setup()

      const dbChannel = await this.getInDb(channel.name)
      if (!dbChannel) {
        await this.createInDb(channel.id, channel.name)
      }
    }
  }

  async get(providerId: string, channelId: string) {
    const providerName = (await this.providerService.getName(providerId))!
    return this.channels.find((x) => x.name === channelId)!.getInstance(providerName)
  }

  list() {
    return this.channels
  }

  private async getInDb(name: string) {
    const rows = await this.db.knex('channels').where({ name })
    if (rows?.length) {
      return rows[0] as DbChannel
    } else {
      return undefined
    }
  }

  private async createInDb(id: uuid, name: string) {
    await this.db.knex('channels').insert({ id, name })
  }
}

interface DbChannel {
  id: uuid
  name: string
}
