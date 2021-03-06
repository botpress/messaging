import { teardownDatabase, teardownRedis } from '@botpress/testing/src'

const teardown = async () => {
  await teardownDatabase()

  if (process.env.REDIS === 'true') {
    await teardownRedis()
  }
}

export default teardown
