import { teardown as teardownDevServer } from 'jest-dev-server'
const jestTeardown = require('./jest.teardown').default

const teardown = async () => {
  await jestTeardown()
  await teardownDevServer()
}

export default teardown
