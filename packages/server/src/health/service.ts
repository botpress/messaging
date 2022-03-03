import { HealthEvent, HealthEventType, HealthReport, HealthReportEvent, uuid } from '@botpress/messaging-base'
import { CachingService, DatabaseService, ServerCache, Service } from '@botpress/messaging-engine'
import { v4 as uuidv4 } from 'uuid'
import { ChannelService } from '../channels/service'
import { ConduitService } from '../conduits/service'
import { InstanceService } from '../instances/service'
import { ProvisionService } from '../provisions/service'
import { HealthEmitter, HealthEvents, HealthWatcher } from './events'
import { HealthListener } from './listener'
import { HealthTable } from './table'

export class HealthService extends Service {
  get events(): HealthWatcher {
    return this.emitter
  }

  private emitter: HealthEmitter
  private table: HealthTable
  private cache!: ServerCache<uuid, HealthReport>
  private listener: HealthListener

  constructor(
    private db: DatabaseService,
    private cachingService: CachingService,
    private channelService: ChannelService,
    private provisionService: ProvisionService,
    private conduitService: ConduitService,
    private instanceService: InstanceService
  ) {
    super()
    this.table = new HealthTable()
    this.emitter = new HealthEmitter()
    this.listener = new HealthListener(this.conduitService, this.instanceService, this)
  }

  async setup() {
    this.cache = await this.cachingService.newServerCache('cache_health_reports')

    await this.db.registerTable(this.table)

    await this.listener.setup()
  }

  async register(conduitId: uuid, type: HealthEventType, data: any = undefined) {
    const event: HealthEvent = {
      id: uuidv4(),
      conduitId,
      time: new Date(),
      type,
      data
    }

    const conduit = await this.conduitService.get(conduitId)
    const provision = await this.provisionService.fetchByProviderId(conduit.providerId)
    if (provision) {
      this.cache.del(provision.clientId, true)
    }

    await this.query().insert(this.serialize(event))
    await this.emitter.emit(HealthEvents.Registered, { event })
  }

  async getHealthForClient(clientId: uuid): Promise<HealthReport> {
    const cached = this.cache.get(clientId)
    if (cached) {
      return cached
    }

    const provision = await this.provisionService.getByClientId(clientId)
    const conduits = await this.conduitService.listByProvider(provision.providerId)

    const report: HealthReport = { channels: {} }

    for (const conduit of conduits) {
      const channel = this.channelService.getById(conduit.channelId)
      const events = await this.listEventsByConduit(conduit.id)
      report.channels[channel.meta.name] = { events: events.map((x) => this.makeReadable(x)) }
    }

    this.cache.set(clientId, report)
    return report
  }

  async listEventsByConduit(conduitId: uuid) {
    const rows = await this.query().where({ conduitId }).orderBy('time', 'desc').limit(20)
    return rows.map((x) => this.deserialize(x))
  }

  makeReadable(event: HealthEvent): HealthReportEvent {
    return {
      type: event.type,
      time: event.time,
      ...(event.data ? { data: event.data } : {})
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }

  private serialize(event: Partial<HealthEvent>) {
    return {
      ...event,
      time: this.db.setDate(event.time),
      data: this.db.setJson(event.data)
    }
  }

  private deserialize(event: any): HealthEvent {
    return {
      ...event,
      time: this.db.getDate(event.time),
      data: this.db.getJson(event.data)
    }
  }
}
