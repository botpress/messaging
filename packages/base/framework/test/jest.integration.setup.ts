import { setupPostgres } from '@botpress/testing/src'

const setup = async () => {
  // Only setup PostgreSQL as we create the SQLite DBs manually during the tests
  if (process.env.POSTGRESQL === 'true') {
    await setupPostgres()
  }
}

export default setup
