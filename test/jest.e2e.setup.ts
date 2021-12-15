// Global setup is performed before a TypeScript environment is made available, so we need to create the environment manually
require('ts-node/register')

import path from 'path'
import { setup as setupDevServer } from 'jest-dev-server'
import { v4 as uuidv4 } from 'uuid'

const setup = async () => {
  process.env.SKIP_LOAD_ENV = 'true'
  process.env.ENABLE_EXPERIMENTAL_SOCKETS = 'true'
  process.env.DATABASE_URL = path.join(__dirname, '.test-data', `${uuidv4()}.sqlite`)

  await setupDevServer({
    command: 'yarn dev',
    launchTimeout: 20000,
    protocol: 'http',
    host: '127.0.0.1',
    port: 3100,
    path: 'status',
    usedPortAction: 'kill'
  })
}

export default setup
