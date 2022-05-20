import { setupDatabase, setupServer } from '@botpress/base-test/src'
import portfinder from 'portfinder'

const setup = async () => {
  process.env.SKIP_LOAD_ENV = 'true'
  process.env.ADMIN_KEY = 'admin123'

  await setupDatabase()

  if (process.env.DATABASE_URL?.startsWith('postgres')) {
    process.env.DATABASE_TRANSIENT = 'true'
  }

  const debug = process.env.DEBUG === 'true'

  const port = await portfinder.getPortPromise()
  process.env.PORT = port.toString()

  await setupServer({
    debug,
    command: 'yarn workspace @botpress/messaging-server dev',
    launchTimeout: 120000,
    protocol: 'http',
    host: '127.0.0.1',
    port,
    path: 'status'
  })
}

export default setup
