import fs from 'fs'
import { teardown as teardownDevServer } from 'jest-dev-server'
import path from 'path'

const teardown = async () => {
  const dir = path.join(__dirname, '.test-data')
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true })
  }

  await teardownDevServer()
}

export default teardown
