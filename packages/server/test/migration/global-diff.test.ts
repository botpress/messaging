import portfinder from 'portfinder'

import { compareDatabases } from './utils/diff'
import { startMessagingServer } from './utils/server'

const NO_MIGRATION = 'no_mig'
const ALL_MIGRATIONS = 'all_migs'
const TIMEOUT = 30000

describe('Global Diff', () => {
  test(
    'Starts Messaging with the latest database schema',
    async () => {
      const port = await portfinder.getPortPromise()
      await startMessagingServer(
        {
          command: 'yarn dev',
          launchTimeout: TIMEOUT,
          protocol: 'http',
          host: '127.0.0.1',
          port,
          path: 'status',
          usedPortAction: 'error'
        },
        NO_MIGRATION
      )
    },
    TIMEOUT
  )

  test(
    'Starts Messaging and runs all migrations',
    async () => {
      await startMessagingServer(
        {
          command: 'yarn dev migrate up',
          launchTimeout: TIMEOUT
        },
        ALL_MIGRATIONS
      )
    },
    TIMEOUT
  )

  test('Make sure that both database schemas are the same', async () => {
    await compareDatabases(NO_MIGRATION, ALL_MIGRATIONS)
  })
})
