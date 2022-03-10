test('TODO: reimplement this', () => {})

/*
import { MigrationService, DatabaseService, ShutDownSignal, getTableId } from '@botpress/messaging-engine'
import schemaInspector from 'knex-schema-inspector'
import { v4 as uuid } from 'uuid'
import { FixClientSchemaMigration } from '../../src/migrations/0.1.20-fix-client-schema'
import { app, setupApp } from '../utils'

const MIGRATION_VERSION = '0.1.20'
const PREVIOUS_VERSION = '0.1.19'

let TABLE: string
const COLUMN = 'providerId'

describe('0.1.20 - Fix Client Schema', () => {
  let migration: MigrationService
  let database: DatabaseService
  let inspector: ReturnType<typeof schemaInspector>

  beforeAll(async () => {
    await setupApp()
    TABLE = getTableId('msg_clients')
    migration = app.migration
    database = app.database

    inspector = schemaInspector(database.knex)
    migration.setMigrations([FixClientSchemaMigration])
  })

  afterAll(async () => {
    await app.destroy()
  })

  beforeEach(async () => {
    app.caching.resetAll()
  })

  // This function allows to create the issue that the migration fixes
  // so that we can make sure it work properly
  const createError = async () => {
    return database.knex.schema.alterTable(TABLE, (table) => {
      table.uuid(COLUMN).notNullable().alter()
    })
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

  const insertClient = async () => {
    const id = uuid()
    await database.knex(TABLE).insert({
      id,
      providerId: null
    })

    return database.knex(TABLE).select().where({ id }).first()
  }

  const isNullable = async (table: string, column: string) => {
    const info = await inspector.columnInfo(table, column)
    return info.is_nullable
  }

  describe('Up', () => {
    test('Should be able to run the up migration successfully', async () => {
      await createError()

      await expect(insertClient()).rejects.toThrow()

      await up(
        async () => {
          await expect(isNullable(TABLE, COLUMN)).resolves.toEqual(false)
        },
        async () => {
          await expect(isNullable(TABLE, COLUMN)).resolves.toEqual(true)
        }
      )

      await expect(insertClient()).resolves.toEqual({
        id: expect.anything(),
        providerId: null
      })
    })

    test('Should be able to run the up migration more than once', async () => {
      await expect(insertClient()).resolves.toEqual({
        id: expect.anything(),
        providerId: null
      })

      await up(
        async () => {
          await expect(isNullable(TABLE, COLUMN)).resolves.toEqual(true)
        },
        async () => {
          await expect(isNullable(TABLE, COLUMN)).resolves.toEqual(true)
        }
      )
    })
  })
})
*/
