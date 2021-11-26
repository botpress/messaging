// Global setup is performed before a TypeScript environment is made available, so we need to create the environment manually
require('ts-node/register')

import fs from 'fs'
import path from 'path'

const dir = path.join(__dirname, '.test-data')

const setup = async () => {
  if (fs.existsSync(dir)) {
    fs.rmdirSync(dir, { recursive: true })
  }

  fs.mkdirSync(dir, 0o755)
}

export default setup
