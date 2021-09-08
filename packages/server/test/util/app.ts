import { App } from '../../src/app'

export let app: App

export const setupApp = async () => {
  app = new App()
  await app.setup()
  return app
}
