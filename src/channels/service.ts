import { Service } from '../base/service'
import { uuid } from '../base/types'
import { DatabaseService } from '../database/service'
import { Channel } from './base/channel'
import { Conduit } from './base/conduit'
import { DiscordChannel } from './discord/channel'
import { MessengerChannel } from './messenger/channel'
import { SlackChannel } from './slack/channel'
import { SmoochChannel } from './smooch/channel'
import { ChannelTable } from './table'
import { TeamsChannel } from './teams/channel'
import { TelegramChannel } from './telegram/channel'
import { TwilioChannel } from './twilio/channel'
import { VonageChannel } from './vonage/channel'

export class ChannelService extends Service {
  private table: ChannelTable

  private channels: Channel<Conduit<any, any>>[]
  private channelsByName: { [name: string]: Channel<Conduit<any, any>> }

  constructor(private db: DatabaseService) {
    super()

    this.table = new ChannelTable()

    this.channels = [
      new MessengerChannel(),
      new SlackChannel(),
      new TeamsChannel(),
      new TelegramChannel(),
      new TwilioChannel(),
      new DiscordChannel(),
      new SmoochChannel(),
      new VonageChannel()
    ]

    this.channelsByName = {}
    for (const channel of this.channels) {
      this.channelsByName[channel.name] = channel
    }
  }

  async setup() {
    await this.db.registerTable(this.table)

    for (const channel of this.channels) {
      if (!(await this.getInDb(channel.name))) {
        await this.createInDb(channel.id, channel.name)
      }
    }
  }

  getByName(name: string) {
    return this.channelsByName[name]
  }

  list() {
    return this.channels
  }

  private async getInDb(name: string) {
    const rows = await this.db.knex('channels').where({ name })
    if (rows?.length) {
      return rows[0]
    } else {
      return undefined
    }
  }

  private async createInDb(id: uuid, name: string) {
    await this.db.knex('channels').insert({ id, name })
  }
}
