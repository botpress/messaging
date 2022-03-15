import { uuid } from '@botpress/messaging-base'
import { DatabaseService, Service } from '@botpress/messaging-engine'
import { v4 as uuidv4 } from 'uuid'
import { HouseTable } from './table'
import { House } from './types'

export class HouseService extends Service {
  private table: HouseTable

  constructor(private db: DatabaseService) {
    super()
    this.table = new HouseTable()
  }

  async setup() {
    await this.db.registerTable(this.table)
  }

  async create(clientId: uuid, address: string): Promise<House> {
    const house = {
      id: uuidv4(),
      clientId,
      address
    }

    await this.query().insert(house)

    return house
  }

  async fetch(id: uuid): Promise<House | undefined> {
    const rows = await this.query().where({ id })
    if (rows?.length) {
      return rows[0]
    }

    return undefined
  }

  public async get(id: uuid): Promise<House> {
    const val = await this.fetch(id)
    if (!val) {
      throw new Error(`House ${id} not found`)
    }
    return val
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
