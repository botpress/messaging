import crypto from 'crypto'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { App } from '../../src/app'
import { Migrations } from '../../src/migrations'

export let app: App

export const setupApp = async (
  { prefix, transient }: { transient: boolean; prefix?: string } = { transient: true }
) => {
  process.env.SKIP_LOAD_ENV = 'true'
  process.env.SUPPRESS_LOGGING = 'true'
  process.env.DATABASE_URL =
    process.env.DATABASE_URL || path.join(__dirname, '../../../../test/.test-data', `${prefix || uuidv4()}.sqlite`)

  if (process.env.DATABASE_URL.startsWith('postgres')) {
    process.env.DATABASE_SUFFIX = `__${prefix || randomLetters(8)}`
    transient && (process.env.DATABASE_TRANSIENT = 'true')
  }

  app = new App()
  await app.prepare(require('../../package.json'), Migrations)
  await app.setup()
  await app.postSetup()

  return app
}

export const destroyApp = async () => {
  await app?.preDestroy()
  await app?.destroy()
  await app?.postDestroy()
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
