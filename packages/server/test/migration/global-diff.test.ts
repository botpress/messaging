import schemaInspector from 'knex-schema-inspector'
import { setupConnection } from './utils/database'

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
    const knexNoMigration = await setupConnection(NO_MIGRATION)
    const knexAllMigrations = await setupConnection(ALL_MIGRATIONS)

    try {
      const noMigrationInspector = schemaInspector(knexNoMigration)
      const allMigrationsInspector = schemaInspector(knexAllMigrations)

      const noMigrationTables = await noMigrationInspector.tableInfo()
      const allMigrationsTables = await allMigrationsInspector.tableInfo()

      for (const table of noMigrationTables) {
        // We have to replace the no_mig suffix from the table name to all_migs when using PostgreSQL
        const allMigrationsTableName = table.name.replace(NO_MIGRATION, ALL_MIGRATIONS)

        const noMigrationTableColumns = await noMigrationInspector.columns(table.name)
        const allMigrationsTableColumns = await allMigrationsInspector.columns(allMigrationsTableName)

        for (const { column } of noMigrationTableColumns) {
          const noMigrationTableColumnInfo = await noMigrationInspector.columnInfo(table.name, column)
          const allMigrationsTableColumnInfo = await allMigrationsInspector.columnInfo(allMigrationsTableName, column)

          expect({
            ...noMigrationTableColumnInfo,
            table: noMigrationTableColumnInfo.table.replace(NO_MIGRATION, '') // We remove the table suffix if present
          }).toEqual({
            ...allMigrationsTableColumnInfo,
            table: allMigrationsTableColumnInfo.table.replace(ALL_MIGRATIONS, '') // We remove the table suffix if present
          })
        }

        expect(noMigrationTableColumns.length).toEqual(allMigrationsTableColumns.length)
      }

      expect(noMigrationTables.length).toEqual(allMigrationsTables.length)
    } finally {
      await knexNoMigration.destroy()
      await knexAllMigrations.destroy()
    }
  })
})
