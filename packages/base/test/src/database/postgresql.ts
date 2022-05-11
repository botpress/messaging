import compose from 'docker-compose'
import knex from 'knex'
import path from 'path'

interface ComposeError {
  exitCode: number
  err: string
  out: string
}

const getErrorMessage = (error: unknown): string => {
  const err = error as ComposeError

  let message = ''
  if (err.err) {
    message = err.err
  }

  return message
}

export const setup = async () => {
  try {
    await compose.upAll({ cwd: path.join(__dirname, '../../misc'), log: process.env.DEBUG === 'true' })
    process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:2345'
  } catch (e) {
    throw new Error(`An error occurred while trying to setup the PostgreSQL database: ${getErrorMessage(e)}`)
  }
}

export const teardown = async () => {
  try {
    await compose.down({ cwd: path.join(__dirname, '../../misc'), log: process.env.DEBUG === 'true' })
  } catch (e) {
    throw new Error(
      `An error occurred while trying to teardown the PostgreSQL database. 
You will need to manually delete the container before re-running these tests. 
${getErrorMessage(e)}`
    )
  }
}

export const createDatabaseIfNotExists = async (url: string, name: string) => {
  if (!name.trim()) {
    return
  }

  const conn = knex({
    client: 'postgres',
    connection: url,
    useNullAsDefault: true
  })

  try {
    const exists = (await conn.raw(`SELECT COUNT(*) FROM pg_database WHERE datname = '${name}'`)).rows?.[0].count > 0

    if (!exists) {
      await conn.raw(`CREATE DATABASE ${name};`)
    }
  } finally {
    await conn.destroy()
  }
}
