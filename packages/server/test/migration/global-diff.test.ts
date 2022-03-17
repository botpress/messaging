const NO_MIGRATION = 'no_mig'
const ALL_MIGRATIONS = 'all_migs'
const TIMEOUT = 30000

describe('Global Diff', () => {
  test('TODO reimplement this', () => {})

  /*
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
        const noMigrationTableColumns = (await noMigrationInspector.columns(table.name))!
        const allMigrationsTableColumns = await allMigrationsInspector.columns(table.name)

        if (!allMigrationsTableColumns) {
          throw new Error(`Table '${table.name}' is missing in the database where we ran all migrations.`)
        }

        for (const { table, column } of noMigrationTableColumns) {
          const noMigrationTableColumnInfo = await noMigrationInspector.columnInfo(table, column)
          const allMigrationsTableColumnInfo = await allMigrationsInspector.columnInfo(table, column)

          if (!allMigrationsTableColumnInfo) {
            throw new Error(
              `Column '${column}' of table '${table}' is missing in the database where we ran all migrations.`
            )
          }

          expect(noMigrationTableColumnInfo).toEqual(allMigrationsTableColumnInfo)
        }

        if (noMigrationTableColumns.length !== allMigrationsTableColumns.length) {
          const difference = allMigrationsTableColumns.filter(
            (x) => !noMigrationTableColumns.some((c) => c.column.includes(x.column))
          )

          throw new Error(
            `The DB on which we ran the migrations contains more columns than the other DB. ${difference
              .map((c) => `Table: ${c.table}; Column ${c.column}`)
              .join(', ')}.`
          )
        }
      }

      if (noMigrationTables.length !== allMigrationsTables.length) {
        const difference = allMigrationsTables.filter((x) => !noMigrationTables.some((t) => t.name.includes(x.name)))

        throw new Error(
          `The DB on which we ran the migrations contains more tables than the other DB. Tables: ${difference
            .map((t) => t.name)
            .join(', ')}.`
        )
      }
    } finally {
      await noMigrationInspector.destroy()
      await allMigrationsInspector.destroy()
    }
  })
  */
})
