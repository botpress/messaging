import compose from 'docker-compose'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const log = process.env.DEBUG === 'true'

export const setupDatabase = async ({ postgresOnly }: { postgresOnly: boolean } = { postgresOnly: false }) => {
  if (process.env.POSTGRESQL === 'true') {
    try {
      await compose.upAll({ cwd: path.join(__dirname), log })
      process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:2345'
    } catch (e) {
      throw new Error(`An error occurred while trying to setup the PostgreSQL database: ${e}`)
    }
  } else if (!postgresOnly) {
    process.env.DATABASE_URL = process.env.DATABASE_URL || path.join(__dirname, '../.test-data', `${uuidv4()}.sqlite`)
  }
}

export const teardownDatabase = async () => {
  if (process.env.POSTGRESQL === 'true') {
    try {
      await compose.down({ cwd: path.join(__dirname), log })
    } catch (e) {
      throw new Error(
        `An error occurred while trying to teardown the PostgreSQL database. 
You will need to manually delete the container before re-running these tests. 
${e}`
      )
    }
  } else {
    const dir = path.join(__dirname, '../.test-data')
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true })
    }
  }
}
