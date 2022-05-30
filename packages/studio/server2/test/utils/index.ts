import path from 'path'
import { App } from '../../src/app'

export let app: App
let env: NodeJS.ProcessEnv

export const setupApp = async (
  { prefix, transient }: { transient: boolean; prefix?: string } = { transient: true }
) => {
  env = { ...process.env }

  process.env.DATA_PATH = path.join(__dirname, 'bot')

  app = new App()
  await app.prepare(require('../../package.json'), [])
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
