import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { DatabaseService } from '../database/service'
import { WebhookTable } from './table'
import { Webhook } from './types'

export class WebhookService extends Service {
  private table: WebhookTable
  private cacheListByClient!: ServerCache<uuid, Webhook[]>

  constructor(private db: DatabaseService, private cachingService: CachingService) {
    super()
    this.table = new WebhookTable()
  }

  async setup() {
    this.cacheListByClient = await this.cachingService.newServerCache('cache_list_webhooks_by_client')

    await this.db.registerTable(this.table)
  }

  async create(clientId: uuid, url: string): Promise<Webhook> {
    const webhook = {
      id: uuidv4(),
      clientId,
      url
    }

    await this.query().insert(webhook)

    this.cacheListByClient.del(clientId)

    return webhook
  }

  async get(id: uuid): Promise<Webhook | undefined> {
    const rows = await this.query().where({ id })
    if (rows?.length) {
      return rows[0]
    } else {
      return undefined
    }
  }

  async delete(id: uuid) {
    const webhook = await this.get(id)
    this.cacheListByClient.del(webhook!.clientId)

    return this.query().where({ id }).del()
  }

  async list(clientId: uuid): Promise<Webhook[]> {
    const cached = this.cacheListByClient.get(clientId)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ clientId })
    this.cacheListByClient.set(clientId, rows)

    return rows
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
