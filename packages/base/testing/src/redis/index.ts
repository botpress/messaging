import compose from 'docker-compose'
import path from 'path'
import { getErrorMessage } from '../compose'

export const setupRedis = async () => {
  try {
    await compose.upOne('redis', { cwd: path.join(__dirname, '../../misc'), log: process.env.DEBUG === 'true' })
    process.env.CLUSTER_ENABLED = 'true'
    process.env.REDIS_URL = 'redis://localhost:9736'
  } catch (e) {
    throw new Error(`An error occurred while trying to setup Redis: ${getErrorMessage(e)}`)
  }
}

export const teardownRedis = async () => {
  try {
    await compose.down({ cwd: path.join(__dirname, '../../misc'), log: process.env.DEBUG === 'true' })
  } catch (e) {
    throw new Error(
      `An error occurred while trying to teardown Redis. 
You will need to manually delete the container before re-running these tests. 
${getErrorMessage(e)}`
    )
  }
}
