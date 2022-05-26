import { teardownDatabase } from '@botpress/testing/src'

const teardown = async () => {
  await teardownDatabase()
}

export default teardown
