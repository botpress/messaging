const jestTeardown = require('./jest.unit.teardown').default

const teardown = async () => {
  await jestTeardown()
}

export default teardown
