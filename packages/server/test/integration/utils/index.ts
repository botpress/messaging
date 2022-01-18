import crypto from 'crypto'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { App } from '../../../src/app'

export let app: App

export const setupApp = async () => {
  process.env.SKIP_LOAD_ENV = 'true'
  process.env.SUPPRESS_LOGGING = 'true'
  process.env.DATABASE_URL =
    process.env.DATABASE_URL || path.join(__dirname, '../../../../../test/.test-data', `${uuidv4()}.sqlite`)

  if (process.env.DATABASE_URL.startsWith('postgres')) {
    process.env.DATABASE_SUFFIX = `__${randomLetters(8)}`
    process.env.DATABASE_TRANSIENT = 'true'
  }

  app = new App()
  await app.setup()
  await app.postSetup()
  return app
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
