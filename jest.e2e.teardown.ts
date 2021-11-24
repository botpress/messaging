import { teardown as teardownDevServer } from 'jest-dev-server'

const teardown = async () => {
  await teardownDevServer()
}

export default teardown
