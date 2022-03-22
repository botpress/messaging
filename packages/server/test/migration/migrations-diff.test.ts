import { Migrations } from '../../src/migrations'

import { compareDatabases } from './utils/diff'
import { decrement } from './utils/semver'
import { startMessagingServer } from './utils/server'

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

    test(
      'Should run each migrations up to the migration we are testing',
      async () => {
        await startMessagingServer(
          {
            command: `yarn dev migrate up --target ${previousVersion}`,
            launchTimeout: TIMEOUT
          },
          beforeMigrationDatabase
        )
      },
      TIMEOUT
    )

    test(
      'Should run the migration without error',
      async () => {
        await startMessagingServer(
          {
            command: `yarn dev migrate up --target ${migrationVersion}`,
            launchTimeout: TIMEOUT
          },
          afterMigrationDatabase
        )
      },
      TIMEOUT
    )

    test(
      'Should be able to revert the migration',
      async () => {
        await startMessagingServer(
          {
            command: `yarn dev migrate down --target ${previousVersion}`,
            launchTimeout: TIMEOUT
          },
          afterMigrationDatabase
        )
      },
      TIMEOUT
    )

    test('Should have the same schemas', async () => {
      await compareDatabases(beforeMigrationDatabase, afterMigrationDatabase)
    })
  })
})
