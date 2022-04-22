import { teardownDatabase } from './setup/database'

const teardown = async () => {
  await teardownDatabase()
}

export default teardown
