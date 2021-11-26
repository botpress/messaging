// Global setup is performed before a TypeScript environment is made available, so we need to create the environment manually
require('ts-node/register')

import jestSetup from './jest.unit.setup'

const setup = async () => {
  await jestSetup()
}

export default setup
