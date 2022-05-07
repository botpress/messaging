import { setup as setupPostgres, teardown as teardownPostgres } from './postgresql'
import { setup as setupSqlite, teardown as teardownSqlite } from './sqlite'

export const setupDatabase = async ({ postgresOnly }: { postgresOnly: boolean } = { postgresOnly: false }) => {
  if (process.env.POSTGRESQL === 'true') {
    await setupPostgres()
  } else if (!postgresOnly) {
    setupSqlite()
  }
}

export const teardownDatabase = async () => {
  if (process.env.POSTGRESQL === 'true') {
    await teardownPostgres()
  } else {
    teardownSqlite()
  }
}
