import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { ConduitService } from '../conduits/service'
import { ConfigService } from '../config/service'
import { DatabaseService } from '../database/service'
import { InstanceService } from '../instances/service'
import { WebhookService } from '../webhooks/service'
import { HealthTable } from './table'
import { HealthEvent, HealthEventType, HealthReport, HealthReportEvent } from './types'
import { HealthWatcher } from './watcher'

export class HealthService extends Service {
  private table: HealthTable
  private cache!: ServerCache<uuid, HealthReport>
  private watcher: HealthWatcher

  constructor(
    private configService: ConfigService,
    private db: DatabaseService,
    private cachingService: CachingService,
    private channelService: ChannelService,
    private clientService: ClientService,
    private webhookService: WebhookService,
    private conduitService: ConduitService,
    private instanceService: InstanceService
  ) {
    super()
    this.table = new HealthTable()
    this.watcher = new HealthWatcher(this.conduitService, this.instanceService, this)
  }

  async setup() {
    this.cache = await this.cachingService.newServerCache('cache_health_reports')

    await this.db.registerTable(this.table)

    await this.watcher.setup()
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
    const client = await this.clientService.getByProviderId(conduit!.providerId)
    if (client) {
      this.cache.del(client.id, true)

      const channel = this.channelService.getById(conduit!.channelId)
      const post = {
        type: 'health',
        client: { id: client.id },
        channel: { id: channel.id, name: channel.name },
        event: this.makeReadable(event)
      }

      // TODO: this code to call webhook is copy pasted. It should be refactored somewhere else
      if (process.env.SPINNED) {
        await this.callWebhook(process.env.SPINNED_URL!, post)
      } else {
        const webhooks = await this.webhookService.list(client.id)

        for (const webhook of webhooks) {
          await this.callWebhook(webhook.url, post)
        }
      }
    }

    await this.query().insert(this.serialize(event))
  }

  // TODO: move this somewhere else
  private async callWebhook(url: string, data: any) {
    const password = process.env.INTERNAL_PASSWORD || this.configService.current.security?.password

    try {
      await axios.post(url, data, { headers: { password } })
    } catch (e) {
      // TODO: maybe we should retry if this call fails
    }
  }

  async getHealthForClient(clientId: uuid): Promise<HealthReport> {
    const cached = this.cache.get(clientId)
    if (cached) {
      return cached
    }

    const client = await this.clientService.getById(clientId)
    const conduits = await this.conduitService.listByProvider(client!.providerId)

    const report: HealthReport = { channels: {} }

    for (const conduit of conduits) {
      const channel = this.channelService.getById(conduit.channelId)
      const events = await this.listEventsByConduit(conduit.id)
      report.channels[channel.name] = { events: events.map((x) => this.makeReadable(x)) }
    }

    this.cache.set(clientId, report)
    return report
  }

  async listEventsByConduit(conduitId: uuid) {
    const rows = await this.query().where({ conduitId }).orderBy('time', 'desc').limit(20)
    return rows.map((x) => this.deserialize(x))
  }

  private makeReadable(event: HealthEvent): HealthReportEvent {
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
      time: this.db.setDate(event.time),
      data: this.db.setJson(event.data)
    }
  }

  public deserialize(event: any): HealthEvent {
    return {
      ...event,
      time: this.db.getDate(event.time),
      data: this.db.getJson(event.data)
    }
  }
}
