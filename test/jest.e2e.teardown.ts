import { teardown as teardownDevServer } from 'jest-dev-server'

import { teardownDatabase } from './setup/database'

const teardown = async () => {
  await teardownDevServer()
  await teardownDatabase()
}

export default teardown
