// Global setup is performed before a TypeScript environment is made available, so we need to create the environment manually
require('ts-node/register')

import { setup as setupDevServer } from 'jest-dev-server'
import path from 'path'
import portfinder from 'portfinder'
import { v4 as uuidv4 } from 'uuid'

const setup = async () => {
  process.env.SKIP_LOAD_ENV = 'true'
  process.env.ADMIN_KEY = 'admin123'
  process.env.DATABASE_URL = process.env.DATABASE_URL || path.join(__dirname, '.test-data', `${uuidv4()}.sqlite`)

  if (process.env.DATABASE_URL.startsWith('postgres')) {
    process.env.DATABASE_TRANSIENT = 'true'
  }

  const port = await portfinder.getPortPromise()
  process.env.PORT = port.toString()

  await setupDevServer({
    command: 'yarn dev',
    launchTimeout: 30000,
    protocol: 'http',
    host: '127.0.0.1',
    port,
    path: 'status',
    usedPortAction: 'error'
  })
}

export default setup
