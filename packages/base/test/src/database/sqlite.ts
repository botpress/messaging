import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export const getTestDataPath = () => {
  return path.resolve(__dirname, '../../../../../test/.test-data')
}

export const setup = () => {
  process.env.DATABASE_URL = process.env.DATABASE_URL || path.join(getTestDataPath(), `${uuidv4()}.sqlite`)
}

export const teardown = () => {
  const dir = path.join(getTestDataPath())
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true })
  }
}
