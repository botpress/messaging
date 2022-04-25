import { Migrations } from '../../src/migrations'

import { destroyApp, setupApp, app } from '../utils'
import { copyDatabase } from './utils/database'
import { compareDatabases } from './utils/diff'
import { handleShutDownSignal } from './utils/error'
import { Seed } from './utils/seed'
import { decrement, increment } from './utils/semver'

const TIMEOUT = 30000
const FIRST_VERSION = '0.0.0'

const sanitize = (str: string) => {
  // Removes invalid characters for PostgreSQL database name
  // (see: https://www.postgresql.org/docs/7/syntax525.htm)
  return str.replace(/\./g, '_').replace(/\-/g, '_').slice(0, 32).toLowerCase()
}

describe('Migrations diff tests', () => {
  const migrations = Migrations.map((m) => {
    const { name, version } = new m().meta
    return [name, version, decrement(version)]
  })

  describe.each(migrations)('%s', (migrationName, migrationVersion, previousVersion) => {
    const afterMigrationDatabase = sanitize(`after_mig_${migrationName}`)
    const beforeMigrationDatabase = sanitize(`before_mig_${migrationName}`)

    let envCopy: NodeJS.ProcessEnv

    beforeEach(() => {
      envCopy = { ...process.env }
    })

    afterEach(async () => {
      await destroyApp()

      process.env = envCopy
    })

    test(
      'Should be able to seed the database properly',
      async () => {
        // We cannot seed an empty database
        if (previousVersion !== FIRST_VERSION) {
          // We simply want to run the first migration so that we have
          // the original database schema where we can now seed data to
          process.env.MIGRATE_CMD = 'up'
          process.env.TESTMIG_DB_VERSION = FIRST_VERSION
          process.env.MIGRATE_TARGET = increment(FIRST_VERSION)

          await handleShutDownSignal(() => setupApp({ prefix: beforeMigrationDatabase, transient: false }))

          const seeder = new Seed(app.database)
          await seeder.run()
        }
      },
      TIMEOUT
    )

    test(
      'Should run each migrations up to the migration we are testing',
      async () => {
        process.env.MIGRATE_CMD = 'up'
        process.env.MIGRATE_TARGET = previousVersion

        await handleShutDownSignal(() => setupApp({ prefix: beforeMigrationDatabase, transient: false }))
      },
      TIMEOUT
    )

    test(
      'Should run the migration without error',
      async () => {
        process.env.MIGRATE_CMD = 'up'
        process.env.MIGRATE_TARGET = migrationVersion

        // We use the same database since we want to be reusing the data it contains.
        // Also, we know that the migrations prior to this one work since they have been tested one by one
        await copyDatabase(beforeMigrationDatabase, afterMigrationDatabase)
        await handleShutDownSignal(() => setupApp({ prefix: afterMigrationDatabase, transient: false }))
      },
      TIMEOUT
    )

    test(
      'Should be able to revert the migration',
      async () => {
        process.env.MIGRATE_CMD = 'down'
        process.env.MIGRATE_TARGET = previousVersion

        await handleShutDownSignal(() => setupApp({ prefix: afterMigrationDatabase, transient: false }))
      },
      TIMEOUT
    )

    test('Should have the same schemas', async () => {
      await compareDatabases(beforeMigrationDatabase, afterMigrationDatabase)
    })
  })
})
