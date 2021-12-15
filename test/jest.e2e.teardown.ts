import fs from 'fs'
import path from 'path'
import { teardown as teardownDevServer } from 'jest-dev-server'

const teardown = async () => {
  const dir = path.join(__dirname, '.test-data')
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true })
  }

  await teardownDevServer()
}

export default teardown
