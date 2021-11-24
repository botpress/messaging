import { v4 as uuidv4 } from 'uuid'
import { App } from '../../../src/app'

let app: App

const setupApp = async () => {
  process.env.DATABASE_URL = `.test-data/${uuidv4()}.sqlite`

  app = new App()
  await app.setup()
  return app
}

export { app, setupApp }
