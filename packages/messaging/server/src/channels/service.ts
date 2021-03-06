import { uuid, Service, DatabaseService, LoggerService, KvsService } from '@botpress/framework'
import {
  Channel,
  MessengerChannel,
  SlackChannel,
  SmoochChannel,
  TeamsChannel,
  TelegramChannel,
  TwilioChannel,
  VonageChannel
} from '@botpress/messaging-channels'
import semver from 'semver'
import { ChannelTable } from './table'

export class ChannelService extends Service {
  private table: ChannelTable

  private channels: Channel[]
  private channelsByNameAndVersion: { [name: string]: Channel }
  private channelsByName: { [name: string]: Channel[] }
  private channelsById: { [id: string]: Channel }

  constructor(private loggers: LoggerService, private db: DatabaseService, private kvs: KvsService) {
    super()

    this.table = new ChannelTable()

    this.channels = [
      new MessengerChannel(),
      new SlackChannel(),
      new TeamsChannel(),
      new TelegramChannel(),
      new TwilioChannel(),
      new SmoochChannel(),
      new VonageChannel()
    ]

    this.channelsByNameAndVersion = {}
    this.channelsByName = {}
    this.channelsById = {}

    for (const channel of this.channels) {
      this.channelsByNameAndVersion[`${channel.meta.name}@${channel.meta.version}`] = channel
      this.channelsById[channel.meta.id] = channel

      if (!this.channelsByName[channel.meta.name]) {
        this.channelsByName[channel.meta.name] = []
      }
      this.channelsByName[channel.meta.name].push(channel)

      channel.logger = this.loggers.root.sub(channel.meta.name)
      channel.kvs = this.kvs
    }

    for (const [name, channels] of Object.entries(this.channelsByName)) {
      this.channelsByName[name] = channels.sort((a, b) => (semver.gt(a.meta.version, b.meta.version) ? -1 : 1))
    }
  }

  async setup() {
    await this.db.registerTable(this.table)
  }

  async postSetup() {
    for (const channel of this.channels) {
      if (!(await this.getInDb(channel.meta.name, channel.meta.version))) {
        await this.createInDb(channel)
      }
    }
  }

  getByNameAndVersion(name: string, version: string) {
    return this.channelsByNameAndVersion[`${name}@${version}`]
  }

  getById(id: uuid) {
    return this.channelsById[id]
  }

  list() {
    return this.channels
  }

  listByName(name: string) {
    return this.channelsByName[name]
  }

  private async getInDb(name: string, version: string) {
    const rows = await this.query().where({ name, version })
    if (rows?.length) {
      return rows[0]
    } else {
      return undefined
    }
  }

  private async createInDb(channel: Channel) {
    await this.query().insert({
      id: channel.meta.id,
      name: channel.meta.name,
      version: channel.meta.version,
      lazy: channel.meta.lazy,
      initiable: channel.meta.initiable
    })
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
