import { App } from '../../src/app'

let app: App

export const getApp = async () => {
  if (app) {
    return app
  }

  process.env.DATABASE_URL = ''

  app = new App()
  await app.setup()
  return app
}
