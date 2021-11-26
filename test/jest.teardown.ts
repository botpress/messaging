import fs from 'fs'
import path from 'path'

const dir = path.join(__dirname, '.test-data')

const teardown = async () => {
  if (fs.existsSync(dir)) {
    fs.rmdirSync(dir, { recursive: true })
  }
}

export default teardown
