import crypto from 'crypto'
import knex from 'knex'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { App } from '../../src/app'
import { Migrations } from '../../src/migrations'

export let app: App
let env: NodeJS.ProcessEnv

export const setupApp = async (
  { prefix, transient }: { transient: boolean; prefix?: string } = { transient: true }
) => {
  env = { ...process.env }

  process.env.SKIP_LOAD_ENV = 'true'
  process.env.SUPPRESS_LOGGING = 'true'
  process.env.DATABASE_URL =
    process.env.DATABASE_URL || path.join(__dirname, '../../../../test/.test-data', `${prefix || uuidv4()}.sqlite`)

  if (process.env.DATABASE_URL.startsWith('postgres')) {
    transient && (process.env.DATABASE_TRANSIENT = 'true')

    const name = prefix || randomLetters(8)
    await createDatabaseIfNotExists(process.env.DATABASE_URL, name)

    process.env.DATABASE_URL = `${process.env.DATABASE_URL}/${name}`
  }

  app = new App()
  await app.prepare(require('../../package.json'), Migrations)
  await app.setup()
  await app.postSetup()

  return app
}

export const destroyApp = async () => {
  if (!app) {
    return
  }

  await app.preDestroy()
  await app.destroy()
  await app.postDestroy()

  process.env = env
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

const randomLetters = (length: number) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  let str = ''
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return str
}

export const randStr = () => {
  return crypto.randomBytes(20).toString('hex')
}

export const sleep = (time: number = 10) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}
