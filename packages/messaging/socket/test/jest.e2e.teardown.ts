import { teardownDatabase, teardownServer } from '@botpress/testing'

const teardown = async () => {
  await teardownServer()
  await teardownDatabase()
}

export default teardown
