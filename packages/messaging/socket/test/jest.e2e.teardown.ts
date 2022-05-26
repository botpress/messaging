import { teardownDatabase, teardownServer } from '@botpress/testing/src'

const teardown = async () => {
  await teardownServer()
  await teardownDatabase()
}

export default teardown
