import { Inspector } from './utils/database'
import { startMessagingServer } from './utils/server'

const NO_MIGRATION = 'no_mig'
const ALL_MIGRATIONS = 'all_migs'
const TIMEOUT = 30000

describe('Global Diff', () => {
  test(
    'Starts Messaging with the latest database schema',
    async () => {
      await startMessagingServer(
        {
          command: 'yarn dev',
          launchTimeout: TIMEOUT,
          protocol: 'http',
          host: '127.0.0.1',
          port: 3100,
          path: 'status',
          usedPortAction: 'error'
        },
        NO_MIGRATION
      )
    },
    TIMEOUT
  )

  test(
    'Starts Messaging and runs all migrations',
    async () => {
      await startMessagingServer(
        {
          command: 'yarn dev migrate up',
          launchTimeout: TIMEOUT
        },
        ALL_MIGRATIONS
      )
    },
    TIMEOUT
  )

  test('Make sure that both database schemas are the same', async () => {
    const noMigrationInspector = new Inspector(NO_MIGRATION)
    const allMigrationsInspector = new Inspector(ALL_MIGRATIONS)

    try {
      const noMigrationTables = await noMigrationInspector.tables()
      const allMigrationsTables = await allMigrationsInspector.tables()

      for (const table of noMigrationTables) {
        const noMigrationTableColumns = await noMigrationInspector.columns(table.name)
        const allMigrationsTableColumns = await allMigrationsInspector.columns(table.name)

        for (const { table, column } of noMigrationTableColumns) {
          const noMigrationTableColumnInfo = await noMigrationInspector.columnInfo(table, column)
          const allMigrationsTableColumnInfo = await allMigrationsInspector.columnInfo(table, column)

          expect(noMigrationTableColumnInfo).toEqual(allMigrationsTableColumnInfo)
        }

        expect(noMigrationTableColumns.length).toEqual(allMigrationsTableColumns.length)
      }

      expect(noMigrationTables.length).toEqual(allMigrationsTables.length)
    } finally {
      await noMigrationInspector.destroy()
      await allMigrationsInspector.destroy()
    }
  })
})
