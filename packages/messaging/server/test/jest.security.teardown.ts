import { teardownDatabase, teardownServer } from '@botpress/base-test/src'

const teardown = async () => {
  await teardownServer()
  await teardownDatabase()
}

export default teardown
