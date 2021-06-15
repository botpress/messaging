import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { DatabaseService } from '../database/service'
import { WebhookTable } from './table'
import { Webhook } from './types'

export class WebhookService extends Service {
  private table: WebhookTable

  constructor(private db: DatabaseService) {
    super()
    this.table = new WebhookTable()
  }

  async setup() {
    await this.db.registerTable(this.table)
  }

  async create(clientId: uuid, url: string): Promise<Webhook> {
    const webhook = {
      id: uuidv4(),
      clientId,
      url
    }

    await this.query().insert(webhook)

    return webhook
  }

  async delete(id: uuid) {
    return this.query().where({ id }).del()
  }

  async list(clientId: uuid): Promise<Webhook[]> {
    return this.query().where({ clientId })
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
