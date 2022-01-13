import { Knex } from 'knex'
import semver from 'semver'
import { Service } from '../base/service'
import { DatabaseService } from '../database/service'
import { MetaTable } from './table'
import { ServerMetadata, ServerMetadataSchema, ServerMetaEntry } from './types'

export class MetaService extends Service {
  private pkg!: ServerMetadata
  private table: MetaTable
  private current?: ServerMetaEntry

  constructor(private db: DatabaseService) {
    super()
    this.table = new MetaTable()
  }

  setPkg(pkg: ServerMetadata) {
    this.pkg = pkg
  }

  async setup() {
    await this.db.registerTable(this.table)
    await this.refresh()
  }

  app() {
    return { version: this.pkg.version }
  }

  get() {
    return this.current?.data
  }

  async refresh() {
    this.current = await this.fetch()
  }

  async update(data: ServerMetadata, trx?: Knex.Transaction) {
    if (!(await (trx || this.db.knex).schema.hasTable(this.table.id))) {
      return
    }

    if (this.get() && semver.eq(this.get()!.version, data.version)) {
      return
    }

    await ServerMetadataSchema.validateAsync(data)

    const entry = {
      time: new Date(),
      data
    }
    this.current = entry

    if (trx) {
      await trx(this.table.id).insert(this.serialize(entry))
    } else {
      await this.query().insert(this.serialize(entry))
    }
  }

  async fetch(): Promise<ServerMetaEntry | undefined> {
    if (!(await this.db.knex.schema.hasTable(this.table.id))) {
      return undefined
    }

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
