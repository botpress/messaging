import { setup as setupDevServer } from 'jest-dev-server'
import portfinder from 'portfinder'

const debug = process.env.DEBUG === 'true'

export const setupServer = async () => {
  const port = await portfinder.getPortPromise()
  process.env.PORT = port.toString()

  await setupDevServer({
    debug,
    command: 'yarn dev',
    launchTimeout: 30000,
    protocol: 'http',
    host: '127.0.0.1',
    port,
    path: 'status',
    usedPortAction: 'error'
  })
}
