import fs from 'fs'
import path from 'path'

const teardown = async () => {
  const dir = path.join(__dirname, '.test-data')
  if (fs.existsSync(dir)) {
    fs.rmdirSync(dir, { recursive: true })
  }
}

export default teardown
