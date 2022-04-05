import { Migrations } from '../../src/migrations'

import { destroyApp, setupApp } from '../utils'
import { compareDatabases } from './utils/diff'
import { handleShutDownSignal } from './utils/error'
import { decrement } from './utils/semver'

const TIMEOUT = 30000

const sanitize = (str: string) => {
  // Removes invalid characters for PostgreSQL table name
  // (see: https://www.postgresql.org/docs/7/syntax525.htm)
  return str.replace(/\./g, '_').replace(/\-/g, '_').slice(0, 32)
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
      'Should run each migrations up to the migration we are testing',
      async () => {
        process.env.MIGRATE_CMD = 'up'
        process.env.TESTMIG_DB_VERSION = '0.0.0'
        process.env.MIGRATE_TARGET = previousVersion

        await handleShutDownSignal(() => setupApp({ prefix: beforeMigrationDatabase, seed: false, transient: false }))
      },
      TIMEOUT
    )

    test(
      'Should run the migration without error',
      async () => {
        process.env.MIGRATE_CMD = 'up'
        process.env.MIGRATE_TARGET = migrationVersion

        await handleShutDownSignal(() => setupApp({ prefix: afterMigrationDatabase, seed: false, transient: false }))
      },
      TIMEOUT
    )

    test(
      'Should be able to revert the migration',
      async () => {
        process.env.MIGRATE_CMD = 'down'
        process.env.MIGRATE_TARGET = previousVersion

        await handleShutDownSignal(() => setupApp({ prefix: afterMigrationDatabase, seed: false, transient: false }))
      },
      TIMEOUT
    )

    test('Should have the same schemas', async () => {
      await compareDatabases(beforeMigrationDatabase, afterMigrationDatabase)
    })
  })
})
