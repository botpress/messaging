import { setup as setupPostgres, teardown as teardownPostgres } from './postgresql'
import { setup as setupSqlite, teardown as teardownSqlite } from './sqlite'

export const setupDatabase = async () => {
  if (process.env.POSTGRESQL === 'true') {
    await setupPostgres()
  } else {
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

export { setupPostgres, teardownPostgres, setupSqlite, teardownSqlite }
