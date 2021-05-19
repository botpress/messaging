import { DatabaseService } from '../database/service'
import { ConversationRepo } from './repo'
import { ConversationTable } from './table'

export class ConversationService {
  private table: ConversationTable
  private repo: ConversationRepo

  constructor(private db: DatabaseService) {
    this.table = new ConversationTable()
    this.repo = new ConversationRepo(this.db, this.table)
  }

  async setup() {
    await this.db.table(this.table.id, this.table.create)
  }
}
