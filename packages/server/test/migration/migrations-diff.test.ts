import fs from 'fs'
import path from 'path'

import { compareDatabases } from './utils/diff'
import { decrement } from './utils/semver-decrement'
import { startMessagingServer } from './utils/server'

const TIMEOUT = 30000

describe('Migrations diff tests', () => {
  const migrationFolder = path.join(__dirname, '../../src/migrations')
  const migrationFiles = fs.readdirSync(migrationFolder)
  const migrations = migrationFiles
    .filter((f) => !isNaN(Number(f.charAt(0)))) // Only keep migration files
    .map((f) => {
      const version = f.split('-')[0]
      return [f, version, decrement(version)]
    })

  describe.each(migrations)('%s', (migrationName, migrationVersion, previousVersion) => {
    const afterMigrationDatabase = `after_mig_${migrationName}`
    const beforeMigrationDatabase = `before_mig_${migrationName}`

    test(
      'Should run each migrations up to the migration we are testing',
      async () => {
        await startMessagingServer(
          {
            command: `yarn start migrate up --target ${previousVersion}`,
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
            command: `yarn start migrate up --target ${migrationVersion}`,
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
            command: `yarn start migrate down --target ${previousVersion}`,
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
