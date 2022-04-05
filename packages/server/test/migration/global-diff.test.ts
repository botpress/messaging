import { destroyApp, setupApp } from '../utils'
import { compareDatabases } from './utils/diff'
import { handleShutDownSignal } from './utils/error'

const NO_MIGRATION = 'no_mig'
const ALL_MIGRATIONS = 'all_migs'
const TIMEOUT = 30000

describe('Global Diff', () => {
  let envCopy: NodeJS.ProcessEnv

  beforeEach(() => {
    envCopy = { ...process.env }
  })

  afterEach(async () => {
    await destroyApp()

    process.env = envCopy
  })

  test(
    'Starts Messaging with the latest database schema',
    async () => {
      await setupApp({ prefix: NO_MIGRATION, seed: false, transient: false })
    },
    TIMEOUT
  )

  test(
    'Starts Messaging and runs all migrations',
    async () => {
      process.env.MIGRATE_CMD = 'up'
      process.env.TESTMIG_DB_VERSION = '0.0.0'

      await handleShutDownSignal(() => setupApp({ prefix: ALL_MIGRATIONS, seed: false, transient: false }))
    },
    TIMEOUT
  )

  test('Make sure that both database schemas are the same', async () => {
    await compareDatabases(NO_MIGRATION, ALL_MIGRATIONS)
  })
})
