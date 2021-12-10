import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { App } from '../../../src/app'

let app: App

const setupApp = async () => {
  process.env.SKIP_LOAD_ENV = 'true'
  process.env.SUPPRESS_LOGGING = 'true'
  process.env.DATABASE_URL = path.join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    '..',
    'test',
    '.test-data',
    `${uuidv4()}.sqlite`
  )

  app = new App()
  await app.setup()
  return app
}

export { app, setupApp }
