import { MigrationService, DatabaseService, ShutDownSignal } from '@botpress/messaging-engine'
import { v4 as uuid } from 'uuid'
import { StatusMigration } from '../../src/migrations/0.1.19-status'
import { StatusTable } from '../../src/status/table'
import { app, setupApp } from '../integration/utils'

const MIGRATION_VERSION = '0.1.19'
const PREVIOUS_VERSION = '0.1.18'

const CONDUITS_TABLE = 'msg_conduits'
const CONDUITS_INITIALIZED = 'initialized'
const STATUS_TABLE = 'msg_status'
const STATUS_TEST_COLUMN = 'initializedOn'

const TELEGRAM_CHANNEL_ID = '0198f4f5-6100-4549-92e5-da6cc31b4ad1'

describe('0.1.19 - Status', () => {
  let migration: MigrationService
  let database: DatabaseService

  beforeAll(async () => {
    await setupApp()
    migration = app.migration
    database = app.database

    migration.setMigrations([StatusMigration])
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
    try {
      await migration.setup()
    } catch (e) {
      if (!(e instanceof ShutDownSignal)) {
        throw e
      }
    }
    await after?.()
  }

  const up = async (before?: () => Promise<void>, after?: () => Promise<void>) => {
    process.env.TESTMIG_DB_VERSION = PREVIOUS_VERSION
    process.env.MIGRATE_TARGET = MIGRATION_VERSION
    process.env.MIGRATE_CMD = 'up'

    await before?.()
    try {
      await migration.setup()
    } catch (e) {
      if (!(e instanceof ShutDownSignal)) {
        throw e
      }
    }
    await after?.()
  }

  const insertConduit = async (initialized?: boolean) => {
    const trx = await database.knex.transaction()

    try {
      const providerId = uuid()
      await trx('msg_providers').insert({
        id: providerId,
        name: uuid(),
        sandbox: false
      })

      const conduit: any = {
        id: uuid(),
        providerId,
        config: { token: uuid() },
        channelId: TELEGRAM_CHANNEL_ID
      }

      if (initialized) {
        conduit['initialized'] = initialized
      }

      await trx(CONDUITS_TABLE).insert(conduit)
      const data = await trx(CONDUITS_TABLE).select().where({ id: conduit.id }).first()

      await trx.commit()

      return data
    } catch (e) {
      await trx.rollback()

      throw e
    }
  }

  const hasColumn = async (table: string, column: string) => {
    return database.knex.schema.hasColumn(table, column)
  }

  describe('Down', () => {
    test('Should be able to run the down migration successfully', async () => {
      await expect(insertConduit(true)).rejects.toThrow()

      await down(
        async () => {
          await expect(hasColumn(CONDUITS_TABLE, CONDUITS_INITIALIZED)).resolves.toEqual(false)
          await expect(hasColumn(STATUS_TABLE, STATUS_TEST_COLUMN)).resolves.toEqual(true)
        },
        async () => {
          await expect(hasColumn(CONDUITS_TABLE, CONDUITS_INITIALIZED)).resolves.toEqual(true)
          await expect(hasColumn(STATUS_TABLE, STATUS_TEST_COLUMN)).resolves.toEqual(false)
        }
      )

      await expect(insertConduit(true)).resolves.toEqual({
        id: expect.anything(),
        providerId: expect.anything(),
        config: expect.anything(),
        channelId: TELEGRAM_CHANNEL_ID,
        initialized: Number(true)
      })
    })

    test('Should be able to run the down migration more than once', async () => {
      await down(
        async () => {
          await expect(hasColumn(CONDUITS_TABLE, CONDUITS_INITIALIZED)).resolves.toEqual(true)
          await expect(hasColumn(STATUS_TABLE, STATUS_TEST_COLUMN)).resolves.toEqual(false)
        },
        async () => {
          await expect(hasColumn(CONDUITS_TABLE, CONDUITS_INITIALIZED)).resolves.toEqual(true)
          await expect(hasColumn(STATUS_TABLE, STATUS_TEST_COLUMN)).resolves.toEqual(false)
        }
      )
    })
  })

  describe('Up', () => {
    test('Should be able to run the up migration successfully', async () => {
      await expect(insertConduit(true)).resolves.toEqual({
        id: expect.anything(),
        providerId: expect.anything(),
        config: expect.anything(),
        channelId: TELEGRAM_CHANNEL_ID,
        initialized: Number(true)
      })

      await up(
        async () => {
          await expect(hasColumn(CONDUITS_TABLE, CONDUITS_INITIALIZED)).resolves.toEqual(true)
          await expect(hasColumn(STATUS_TABLE, STATUS_TEST_COLUMN)).resolves.toEqual(false)
        },
        async () => {
          await expect(hasColumn(CONDUITS_TABLE, CONDUITS_INITIALIZED)).resolves.toEqual(false)
          await expect(hasColumn(STATUS_TABLE, STATUS_TEST_COLUMN)).resolves.toEqual(true)
        }
      )

      await expect(insertConduit(true)).rejects.toThrow()
    })

    test('Should be able to run the up migration more than once', async () => {
      await up(
        async () => {
          await expect(hasColumn(CONDUITS_TABLE, CONDUITS_INITIALIZED)).resolves.toEqual(false)
          await expect(hasColumn(STATUS_TABLE, STATUS_TEST_COLUMN)).resolves.toEqual(true)
        },
        async () => {
          await expect(hasColumn(CONDUITS_TABLE, CONDUITS_INITIALIZED)).resolves.toEqual(false)
          await expect(hasColumn(STATUS_TABLE, STATUS_TEST_COLUMN)).resolves.toEqual(true)
        }
      )
    })
  })
})
