// Global setup is performed before a TypeScript environment is made available, so we need to create the environment manually
require('ts-node').register({ transpileOnly: true })

import { setupDatabase } from './setup/database'
import { setupServer } from './setup/server'

const setup = async () => {
  process.env.SKIP_LOAD_ENV = 'true'
  process.env.ADMIN_KEY = 'admin123'

  await setupDatabase()

  if (process.env.DATABASE_URL?.startsWith('postgres')) {
    process.env.DATABASE_TRANSIENT = 'true'
  }

  await setupServer()
}

export default setup
