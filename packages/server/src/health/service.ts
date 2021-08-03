import clc from 'cli-color'
import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { ConduitService } from '../conduits/service'
import { DatabaseService } from '../database/service'
import { InstanceService } from '../instances/service'
import { Logger } from '../logger/types'
import { ProviderService } from '../providers/service'
import { HealthTable } from './table'
import { HealthEvent, HealthEventType } from './types'
import { HealthWatcher } from './watcher'

export class HealthService extends Service {
  private table: HealthTable
  private watcher: HealthWatcher
  private logger = new Logger('Health')

  constructor(
    private db: DatabaseService,
    private channelService: ChannelService,
    private providerService: ProviderService,
    private clientService: ClientService,
    private conduitService: ConduitService,
    private instanceService: InstanceService
  ) {
    super()
    this.table = new HealthTable()
    this.watcher = new HealthWatcher(this.conduitService, this.instanceService, this)
  }

  async setup() {
    await this.db.registerTable(this.table)

    await this.watcher.setup()
  }

  async register(conduitId: uuid, type: HealthEventType, data: any = undefined) {
    const conduit = await this.conduitService.get(conduitId)
    const provider = await this.providerService.getById(conduit!.providerId)
    const channel = this.channelService.getById(conduit!.channelId)

    this.logger.info(`[${provider!.name}] ${clc.bold(channel.name)} ${type}`)

    const event: HealthEvent = {
      id: uuidv4(),
      conduitId,
      time: new Date(),
      type,
      data
    }

    await this.query().insert(this.serialize(event))
  }

  async getHealthForClient(clientId: uuid) {
    const client = await this.clientService.getById(clientId)
    const provider = await this.providerService.getById(client!.providerId)
    const conduits = await this.conduitService.listByProvider(provider!.id)

    const channels: any = {}

    for (const conduit of conduits) {
      const channel = this.channelService.getById(conduit.channelId)
      const events = await this.listEventsByConduit(conduit.id)
      channels[channel.name] = { events: events.map((x) => this.makeReadable(x)) }
    }

    return {
      channels
    }
  }

  async listEventsByConduit(conduitId: uuid) {
    const rows = await this.query().where({ conduitId }).orderBy('time', 'desc')
    return rows.map((x) => this.deserialize(x))
  }

  private makeReadable(event: HealthEvent) {
    return {
      type: event.type,
      time: event.time,
      ...(event.data ? { data: event.data } : {})
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }

  public serialize(event: Partial<HealthEvent>) {
    return {
      ...event,
      time: this.db.setDate(event.time)
    }
  }

  public deserialize(event: any): HealthEvent {
    return {
      ...event,
      time: this.db.getDate(event.time)
    }
  }
}
