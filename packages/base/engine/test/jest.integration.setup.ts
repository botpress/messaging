import { setupPostgres, setupRedis } from '@botpress/testing'

const setup = async () => {
  // Only setup PostgreSQL as we create the SQLite DBs manually during the tests
  if (process.env.POSTGRESQL === 'true') {
    await setupPostgres()
  }

  if (process.env.REDIS === 'true') {
    await setupRedis()
  }
}

export default setup
