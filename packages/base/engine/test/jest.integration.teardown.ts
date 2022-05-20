import { teardownDatabase, teardownRedis } from '@botpress/base-test/src'

const teardown = async () => {
  await teardownDatabase()

  if (process.env.REDIS === 'true') {
    await teardownRedis()
  }
}

export default teardown
