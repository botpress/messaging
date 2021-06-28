import { Service } from '../base/service'
import { uuid } from '../base/types'
import { DatabaseService } from '../database/service'
import { Channel } from './base/channel'
import { ConduitInstance } from './base/conduit'
import { DiscordChannel } from './discord/channel'
import { MessengerChannel } from './messenger/channel'
import { SlackChannel } from './slack/channel'
import { SmoochChannel } from './smooch/channel'
import { ChannelTable } from './table'
import { TeamsChannel } from './teams/channel'
import { TelegramChannel } from './telegram/channel'
import { TwilioChannel } from './twilio/channel'
import { VonageChannel } from './vonage/channel'
import { WebChannel } from './web/channel'

export class ChannelService extends Service {
  private table: ChannelTable

  private channels: Channel<ConduitInstance<any, any>>[]
  private channelsByName: { [name: string]: Channel<ConduitInstance<any, any>> }
  private channelsById: { [id: string]: Channel<ConduitInstance<any, any>> }

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
      new VonageChannel(),
      new WebChannel()
    ]

    this.channelsByName = {}
    this.channelsById = {}

    for (const channel of this.channels) {
      this.channelsByName[channel.name] = channel
      this.channelsById[channel.id] = channel
    }
  }

  async setup() {
    await this.db.registerTable(this.table)

    for (const channel of this.channels) {
      if (!(await this.getInDb(channel.name))) {
        await this.createInDb(channel)
      }
    }
  }

  getByName(name: string) {
    return this.channelsByName[name]
  }

  getById(id: uuid) {
    return this.channelsById[id]
  }

  list() {
    return this.channels
  }

  private async getInDb(name: string) {
    const rows = await this.query().where({ name })
    if (rows?.length) {
      return rows[0]
    } else {
      return undefined
    }
  }

  private async createInDb(channel: Channel<ConduitInstance<any, any>>) {
    await this.query().insert({ id: channel.id, name: channel.name, lazy: channel.lazy, initable: channel.initable })
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
