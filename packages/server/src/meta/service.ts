import { Service } from '../base/service'
import { DatabaseService } from '../database/service'
import { MetaTable } from './table'
import { ServerMetadata, ServerMetadataSchema, ServerMetaEntry } from './types'

const pkg = require('../../package.json')

export class MetaService extends Service {
  private table: MetaTable
  private current!: ServerMetaEntry

  constructor(private db: DatabaseService) {
    super()
    this.table = new MetaTable()
  }

  async setup() {
    await this.db.registerTable(this.table)

    const stored = await this.fetch()
    if (stored) {
      this.current = stored
    } else {
      const meta: ServerMetadata = {
        version: pkg.version
      }
      await this.update(meta)
    }
  }

  get() {
    return this.current
  }

  async update(data: ServerMetadata) {
    await ServerMetadataSchema.validateAsync(data)

    const entry = {
      time: new Date(),
      data
    }
    this.current = entry

    return this.query().insert(this.serialize(entry))
  }

  async fetch() {
    const rows = await this.query().orderBy('time', 'desc').limit(1)

    if (rows?.length) {
      return this.deserialize(rows[0])
    }

    return undefined
  }

  private serialize(entry: ServerMetaEntry) {
    return {
      ...entry,
      time: this.db.setDate(entry.time),
      data: this.db.setJson(entry.data)
    }
  }

  private deserialize(entry: any): ServerMetaEntry {
    return {
      ...entry,
      time: this.db.getDate(entry.time),
      data: this.db.getJson(entry.data)
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
