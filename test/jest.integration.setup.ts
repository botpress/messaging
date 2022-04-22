// Global setup is performed before a TypeScript environment is made available, so we need to create the environment manually
require('ts-node').register({ transpileOnly: true })

import { setupDatabase } from './setup/database'

const setup = async () => {
  await setupDatabase({ postgresOnly: true })
}

export default setup
