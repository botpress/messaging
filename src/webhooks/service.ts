import { Service } from '../base/service'
import { DatabaseService } from '../database/service'
import { WebhookTable } from './table'

export class WebhookService extends Service {
  // TODO: everything

  private table: WebhookTable

  constructor(private db: DatabaseService) {
    super()
    this.table = new WebhookTable()
  }

  async setup() {
    await this.db.registerTable(this.table)
  }
}
