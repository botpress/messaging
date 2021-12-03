import { uuid } from '@botpress/messaging-base'
import { Channel, TeamsChannel, TelegramChannel, TwilioChannel } from '@botpress/messaging-channels'
import { Service, DatabaseService } from '@botpress/messaging-engine'
import { ChannelTable } from './table'

export class ChannelService extends Service {
  private table: ChannelTable

  private channels: Channel<any, any, any, any>[]
  private channelsByName: { [name: string]: Channel<any, any, any, any> }
  private channelsById: { [id: string]: Channel<any, any, any, any> }

  constructor(private db: DatabaseService) {
    super()

    this.table = new ChannelTable()

    this.channels = [new TeamsChannel(), new TelegramChannel(), new TwilioChannel()]

    this.channelsByName = {}
    this.channelsById = {}

    for (const channel of this.channels) {
      this.channelsByName[channel.meta.name] = channel
      this.channelsById[channel.meta.id] = channel
    }
  }

  async setup() {
    await this.db.registerTable(this.table)

    for (const channel of this.channels) {
      if (!(await this.getInDb(channel.meta.name))) {
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

  private async createInDb(channel: Channel<any, any, any, any>) {
    await this.query().insert({
      id: channel.meta.id,
      name: channel.meta.name,
      lazy: channel.meta.lazy,
      initiable: channel.meta.initiable
    })
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
