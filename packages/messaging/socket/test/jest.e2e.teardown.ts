// FIXME: ts-node seems to require the '/src' part for some reason
import { teardownDatabase, teardownServer } from '@botpress/base-test/src'

const teardown = async () => {
  await teardownServer()
  await teardownDatabase()
}

export default teardown
