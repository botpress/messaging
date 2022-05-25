import { teardownDatabase } from '@botpress/testing'

const teardown = async () => {
  await teardownDatabase()
}

export default teardown
