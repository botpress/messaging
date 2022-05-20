import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export const getTestDataPath = () => {
  return path.resolve(__dirname, '../../../../../test/.test-data')
}

export const setup = () => {
  // Note: If we receive a value for DATABASE_URL, we take for granted that the user owns the database
  process.env.DATABASE_URL = process.env.DATABASE_URL || path.join(getTestDataPath(), `${uuidv4()}.sqlite`)
}

export const teardown = () => {
  // We only delete the SQLite DB we created. We consider, when receiving a value for DATABASE_URL,
  // that the user owns the DB and should tear it down
  const dir = path.join(getTestDataPath())
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true })
  }
}
