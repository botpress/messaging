import { teardown as teardownDevServer } from 'jest-dev-server'
const jestTeardown = require('./jest.unit.teardown').default

const teardown = async () => {
  await jestTeardown()
  await teardownDevServer()
}

export default teardown
