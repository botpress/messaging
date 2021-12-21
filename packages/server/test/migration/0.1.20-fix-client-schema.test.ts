import { MigrationService, DatabaseService } from '@botpress/messaging-engine'
import schemaInspector from 'knex-schema-inspector'
import { v4 as uuid } from 'uuid'
import { FixClientSchemaMigration } from '../../src/migrations/0.1.20-fix-client-schema'
import { app, setupApp } from '../integration/utils'

const MIGRATION_VERSION = '0.1.20'
const PREVIOUS_VERSION = '0.1.19'

const TABLE = 'msg_clients'
const COLUMN = 'providerId'

describe('0.1.20 - Fix Client Schema', () => {
  let migration: MigrationService
  let database: DatabaseService
  let inspector: ReturnType<typeof schemaInspector>

  beforeAll(async () => {
    await setupApp()
    migration = app.migration
    database = app.database

    inspector = schemaInspector(database.knex)
    migration.setupMigrations([FixClientSchemaMigration])
  })

  afterAll(async () => {
    await app.destroy()
    await database.destroy()
  })

  beforeEach(async () => {
    app.caching.resetAll()
  })

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
    await migration.setup()
    await after?.()
  }

  const insertClient = async () => {
    const id = uuid()
    await database.knex(TABLE).insert({
      id,
      providerId: null,
      token: uuid()
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
        providerId: null,
        token: expect.anything()
      })
    })

    test('Should be able to run the up migration more than once', async () => {
      await expect(insertClient()).resolves.toEqual({
        id: expect.anything(),
        providerId: null,
        token: expect.anything()
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
