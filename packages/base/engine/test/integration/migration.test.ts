import { Migration, MigrationService } from '../../src'
import { setupApp, destroyApp, engine } from '../utils'
import { handleShutDownSignal } from '../utils/error'

export class TestMigration extends Migration {
  meta = {
    name: TestMigration.name,
    description: 'Test migration',
    version: '1.0.0' // Should be higher than the application version
  }

  async valid() {
    return true
  }

  async applied() {
    return this.isDown
  }

  async up() {
    await this.trx.schema.createTable('key_value', (table) => {
      table.uuid('id').primary()
      table.string('key').unique().notNullable()
      table.jsonb('value').notNullable()
    })

    await this.trx.schema.createTable('test', (table) => {
      table.uuid('id').primary()
      table.uuid('keyId').references('id').inTable('key_value').notNullable().onDelete('cascade')
      table.timestamp('time').notNullable()
      table.string('type').notNullable()
      table.index(['keyId', 'time'])
    })
  }

  async down() {
    await this.trx.schema.dropTable('test')
    await this.trx.schema.dropTable('key_value')
  }
}

export class BrokenMigration extends Migration {
  meta = {
    name: BrokenMigration.name,
    description: 'Broken migration',
    version: '2.0.0' // Should be higher than the application version
  }

  async valid() {
    return true
  }

  async applied() {
    return false
  }

  async up() {
    throw new Error('This migration is broken')
  }

  async down() {
    throw new Error('This migration is broken')
  }
}

const EXPECTED_CURRENT_VERSION = '0.0.1'

describe('MigrationService', () => {
  let migration: MigrationService

  beforeAll(async () => {
    await setupApp()

    migration = engine.migration

    engine.meta.setPkg({ version: EXPECTED_CURRENT_VERSION }) // So we can set a dest version lower than the app version
  })

  afterAll(async () => {
    await destroyApp()
  })

  describe('SetMigrations', () => {
    test('Should be able to set an empty list of migrations', async () => {
      migration.setMigrations([])

      expect(migration['migs']).toEqual([])
    })

    test('Should be able to set the list of migrations to run', async () => {
      migration.setMigrations([TestMigration])

      expect(migration['migs']).toEqual([TestMigration])
    })
  })

  describe('Setup', () => {
    test('Should not run the down migration if it targets a version is higher than the current application version', async () => {
      process.env.MIGRATE_TARGET = '99.99.99'
      process.env.MIGRATE_CMD = 'down'

      const currentMeta = engine.meta.app()
      expect(currentMeta?.version).toEqual(EXPECTED_CURRENT_VERSION)

      await handleShutDownSignal(() => migration.setup(), { expectedCode: 1 })

      expect(engine.meta.get()).not.toEqual(currentMeta)

      delete process.env.MIGRATE_TARGET
      delete process.env.MIGRATE_CMD
    })

    test('Should not run the migrations if it targets a version lower than the current application version', async () => {
      process.env.MIGRATE_TARGET = '0.0.0' // Should be lower than the current application version set in the beforeAll step
      process.env.TESTMIG_DB_VERSION = '99.99.99'

      const currentMeta = engine.meta.app()
      expect(currentMeta?.version).toEqual(EXPECTED_CURRENT_VERSION)

      await handleShutDownSignal(() => migration.setup(), { expectedCode: 1 })

      expect(engine.meta.get()).not.toEqual(currentMeta)

      delete process.env.MIGRATE_TARGET
    })

    test('Should not run the migrations if it targets version is higher than the application version', async () => {
      process.env.MIGRATE_TARGET = '99.99.99'

      const currentMeta = engine.meta.app()
      expect(currentMeta?.version).toEqual(EXPECTED_CURRENT_VERSION)

      await handleShutDownSignal(() => migration.setup(), { expectedCode: 1 })

      expect(engine.meta.get()).not.toEqual(currentMeta)

      delete process.env.TESTMIG_DB_VERSION
    })

    test('Should not save changes made to the database when in dry run', async () => {
      process.env.MIGRATE_DRYRUN = 'true'
      process.env.TESTMIG_DB_VERSION = '0.0.0'
      process.env.MIGRATE_TARGET = '1.0.0' // TestMigration version
      engine.meta.setPkg({ version: process.env.MIGRATE_TARGET })

      await handleShutDownSignal(() => migration.setup())

      expect(engine.meta.get()!.version).not.toEqual(process.env.MIGRATE_TARGET)

      engine.meta.setPkg({ version: EXPECTED_CURRENT_VERSION })
      delete process.env.MIGRATE_DRYRUN
      delete process.env.TESTMIG_DB_VERSION
      delete process.env.MIGRATE_TARGET
    })

    test('Should only update the database version of there is no migration to run and no command specified', async () => {
      const currentMeta = engine.meta.app()
      expect(currentMeta?.version).toEqual(EXPECTED_CURRENT_VERSION)

      await migration.setup()

      expect(engine.meta.get()).toEqual(currentMeta)
    })

    test('Should not run migrations if auto migrate is false and there are pending migrations', async () => {
      process.env.AUTO_MIGRATE = 'false'
      process.env.TESTMIG_DB_VERSION = '0.0.0'
      process.env.MIGRATE_TARGET = '1.0.0' // TestMigration version
      engine.meta.setPkg({ version: process.env.MIGRATE_TARGET })

      await handleShutDownSignal(() => migration.setup(), { expectedCode: 1 })

      expect(engine.meta.get()!.version).not.toEqual(process.env.MIGRATE_TARGET)

      engine.meta.setPkg({ version: EXPECTED_CURRENT_VERSION })
      delete process.env.AUTO_MIGRATE
      delete process.env.TESTMIG_DB_VERSION
      delete process.env.MIGRATE_TARGET
    })

    test('Should be able to run the up migration otherwise', async () => {
      process.env.AUTO_MIGRATE = 'true'
      process.env.TESTMIG_DB_VERSION = '0.0.0'
      process.env.MIGRATE_TARGET = '1.0.0' // TestMigration version
      engine.meta.setPkg({ version: process.env.MIGRATE_TARGET })

      await migration.setup()

      expect(engine.meta.get()?.version).toEqual(process.env.MIGRATE_TARGET)
      await expect(migration['db'].knex.schema.hasTable('key_value')).resolves.toBeTruthy()
      await expect(migration['db'].knex.schema.hasTable('test')).resolves.toBeTruthy()

      delete process.env.AUTO_MIGRATE
      delete process.env.TESTMIG_DB_VERSION
      delete process.env.MIGRATE_TARGET
    })

    test('Should be able to run the down migration too', async () => {
      process.env.MIGRATE_CMD = 'down'
      process.env.MIGRATE_TARGET = EXPECTED_CURRENT_VERSION

      await handleShutDownSignal(() => migration.setup())

      expect(engine.meta.get()?.version).toEqual(process.env.MIGRATE_TARGET)
      await expect(migration['db'].knex.schema.hasTable('key_value')).resolves.toBeFalsy()
      await expect(migration['db'].knex.schema.hasTable('test')).resolves.toBeFalsy()

      delete process.env.MIGRATE_CMD
      delete process.env.MIGRATE_TARGET
    })

    test('Should throw an error and undo the changes if a migration fails', async () => {
      process.env.AUTO_MIGRATE = 'true'
      process.env.MIGRATE_TARGET = '2.0.0' // BrokenMigration version

      engine.meta.setPkg({ version: process.env.MIGRATE_TARGET })

      migration.setMigrations([BrokenMigration, TestMigration])

      await handleShutDownSignal(() => migration.setup(), { expectedCode: 1 })

      expect(engine.meta.get()!.version).not.toEqual(process.env.MIGRATE_TARGET)

      await expect(migration['db'].knex.schema.hasTable('key_value')).resolves.toBeFalsy()
      await expect(migration['db'].knex.schema.hasTable('test')).resolves.toBeFalsy()

      delete process.env.AUTO_MIGRATE
      delete process.env.MIGRATE_TARGET
    })
  })
})
