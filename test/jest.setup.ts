// Global setup is performed before a TypeScript environment is made available, so we need to create the environment manually
require('ts-node/register')

import fs from 'fs'

const setup = async () => {
  const databasePath = './packages/server/dist/data/db.sqlite'
  if (fs.existsSync(databasePath)) {
    fs.unlinkSync(databasePath)
  }
}

export default setup
