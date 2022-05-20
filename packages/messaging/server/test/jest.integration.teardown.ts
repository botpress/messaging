import { teardownDatabase } from '@botpress/base-test/src'

const teardown = async () => {
  await teardownDatabase()
}

export default teardown
