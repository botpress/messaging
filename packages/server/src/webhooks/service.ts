import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { CryptoService } from '../crypto/service'
import { DatabaseService } from '../database/service'
import { WebhookTable } from './table'
import { Webhook } from './types'

export class WebhookService extends Service {
  private table: WebhookTable
  private cacheListByClient!: ServerCache<uuid, Webhook[]>

  constructor(
    private db: DatabaseService,
    private cachingService: CachingService,
    private cryptoService: CryptoService
  ) {
    super()
    this.table = new WebhookTable()
  }

  async setup() {
    this.cacheListByClient = await this.cachingService.newServerCache('cache_list_webhooks_by_client')

    await this.db.registerTable(this.table)
  }

  async generateToken(): Promise<string> {
    return crypto.randomBytes(66).toString('base64')
  }

  async create(clientId: uuid, token: string, url: string): Promise<Webhook> {
    const webhook = {
      id: uuidv4(),
      clientId,
      url,
      token
    }

    await this.query().insert(await this.serialize(webhook))

    this.cacheListByClient.del(clientId, true)

    return webhook
  }

  async get(id: uuid): Promise<Webhook | undefined> {
    const rows = await this.query().where({ id })
    if (rows?.length) {
      return this.deserialize(rows[0])
    } else {
      return undefined
    }
  }

  async delete(id: uuid) {
    const webhook = await this.get(id)
    this.cacheListByClient.del(webhook!.clientId, true)

    return this.query().where({ id }).del()
  }

  async list(clientId: uuid): Promise<Webhook[]> {
    const cached = this.cacheListByClient.get(clientId)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ clientId })
    const webhooks = rows.map((x) => this.deserialize(x))

    this.cacheListByClient.set(clientId, webhooks)

    return webhooks
  }

  private serialize(webhook: Partial<Webhook>) {
    return {
      ...webhook,
      token: this.cryptoService.encrypt(webhook.token!)
    }
  }

  private deserialize(webhook: any): Webhook {
    return {
      ...webhook,
      token: this.cryptoService.decrypt(webhook.token)
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
