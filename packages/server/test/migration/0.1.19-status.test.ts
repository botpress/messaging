import { MigrationService, DatabaseService } from '@botpress/messaging-engine'
import { StatusMigration } from '../../src/migrations/0.1.19-status'
import { StatusTable } from '../../src/status/table'
import { app, setupApp } from '../integration/utils'

const MIGRATION_VERSION = '0.1.19'
const PREVIOUS_VERSION = '0.1.18'

const TABLE = 'msg_conduits'
const COLUMN = 'initialized'
const STATUS_TABLE = 'msg_status'

describe('0.1.19 - Status', () => {
  let migration: MigrationService
  let database: DatabaseService

  beforeAll(async () => {
    await setupApp()
    migration = app.migration
    database = app.database

    migration.setupMigrations([StatusMigration])
  })

  afterAll(async () => {
    await app.destroy()
    await database.destroy()
  })

  beforeEach(async () => {
    app.caching.resetAll()
  })

  const down = async (before?: () => Promise<void>, after?: () => Promise<void>) => {
    process.env.TESTMIG_DB_VERSION = MIGRATION_VERSION
    process.env.MIGRATE_TARGET = PREVIOUS_VERSION
    process.env.MIGRATE_CMD = 'down'

    await before?.()
    await migration.setup()
    await after?.()
  }

  const up = async (before?: () => Promise<void>, after?: () => Promise<void>) => {
    process.env.TESTMIG_DB_VERSION = PREVIOUS_VERSION
    process.env.MIGRATE_TARGET = MIGRATION_VERSION
    process.env.MIGRATE_CMD = 'up'

    await before?.()
    await migration.setup()
    await after?.()
  }

  const hasColumn = async (table: string, column: string) => {
    return database.knex.schema.hasColumn(table, column)
  }

  const hasTable = async (table: string) => {
    return database.knex.schema.hasTable(table)
  }

  describe('Down', () => {
    test('Should be able to run the down migration successfully', async () => {
      await down(
        async () => {
          await expect(hasColumn(TABLE, COLUMN)).resolves.toEqual(false)
          await expect(hasTable(STATUS_TABLE)).resolves.toEqual(true)
        },
        async () => {
          await expect(hasColumn(TABLE, COLUMN)).resolves.toEqual(true)
          await expect(hasTable(STATUS_TABLE)).resolves.toEqual(false)
        }
      )
    })

    test('Should be able to run the down migration more than once', async () => {
      await down(
        async () => {
          await expect(hasColumn(TABLE, COLUMN)).resolves.toEqual(true)
          await expect(hasTable(STATUS_TABLE)).resolves.toEqual(false)
        },
        async () => {
          await expect(hasColumn(TABLE, COLUMN)).resolves.toEqual(true)
          await expect(hasTable(STATUS_TABLE)).resolves.toEqual(false)
        }
      )
    })
  })

  describe('Up', () => {
    test('Should be able to run the up migration successfully', async () => {
      await up(
        async () => {
          await expect(hasColumn(TABLE, COLUMN)).resolves.toEqual(true)
          await expect(hasTable(STATUS_TABLE)).resolves.toEqual(false)
        },
        async () => {
          await expect(hasColumn(TABLE, COLUMN)).resolves.toEqual(false)
          await expect(hasTable(STATUS_TABLE)).resolves.toEqual(false)
        }
      )
    })

    test('Should be able to run the up migration more than once', async () => {
      await up(
        async () => {
          await expect(hasColumn(TABLE, COLUMN)).resolves.toEqual(false)
          await expect(hasTable(STATUS_TABLE)).resolves.toEqual(false)
        },
        async () => {
          await expect(hasColumn(TABLE, COLUMN)).resolves.toEqual(false)
          await expect(hasTable(STATUS_TABLE)).resolves.toEqual(false)
        }
      )
    })

    test('Should remove the status table when it exists', async () => {
      await down()

      const table = new StatusTable()
      await database.registerTable(table)

      await up(
        async () => {
          await expect(hasColumn(TABLE, COLUMN)).resolves.toEqual(true)
          await expect(hasTable(STATUS_TABLE)).resolves.toEqual(true)
        },
        async () => {
          await expect(hasColumn(TABLE, COLUMN)).resolves.toEqual(false)
          await expect(hasTable(STATUS_TABLE)).resolves.toEqual(false)
        }
      )
    })
  })
})
