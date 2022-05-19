import { setupDatabase, setupRedis } from '@botpress/base-test/src'

const setup = async () => {
  // Only setup PostgreSQL as we create the SQLite DBs manually during the tests
  await setupDatabase({ postgresOnly: true })

  if (process.env.REDIS === 'true') {
    await setupRedis()
  }
}

export default setup
