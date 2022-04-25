import { teardownDatabase } from './setup/database'
import { teardown as teardownDevServer } from 'jest-dev-server'

const teardown = async () => {
  await teardownDevServer()
  await teardownDatabase()
}

export default teardown
