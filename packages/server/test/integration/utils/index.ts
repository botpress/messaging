import crypto from 'crypto'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { App } from '../../../src/app'

export let app: App

export const setupApp = async () => {
  process.env.SKIP_LOAD_ENV = 'true'
  process.env.SUPPRESS_LOGGING = 'true'
  process.env.DATABASE_URL = path.join(__dirname, '../../../../../etc/jest/.test-data', `${uuidv4()}.sqlite`)

  app = new App()
  await app.setup()
  await app.postSetup()
  return app
}

export const randStr = () => {
  return crypto.randomBytes(20).toString('hex')
}
