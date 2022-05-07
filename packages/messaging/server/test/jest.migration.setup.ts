import { setupDatabase } from '@botpress/base-test/src'

const setup = async () => {
  // Only setup PostgreSQL as we create the SQLite DBs manually during the tests
  await setupDatabase({ postgresOnly: true })
}

export default setup
