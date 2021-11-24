const jestTeardown = require('./jest.teardown').default

const teardown = async () => {
  await jestTeardown()
}

export default teardown
