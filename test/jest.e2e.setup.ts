// Global setup is performed before a TypeScript environment is made available, so we need to create the environment manually
require('ts-node/register')

import { setup as setupDevServer } from 'jest-dev-server'
import jestSetup from './jest.setup'

const setup = async () => {
  await jestSetup()

  // TODO: Maybe put this somewhere else?
  process.env.ENABLE_EXPERIMENTAL_SOCKETS = 'true'

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
