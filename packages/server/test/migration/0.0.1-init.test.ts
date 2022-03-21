import { compareDatabases } from './utils/diff'
import { startMessagingServer } from './utils/server'

const MIGRATION_VERSION = '0.0.1'
const PREVIOUS_VERSION = '0.0.0'

const MIGRATION_NAME = '0.0.1-init'
const AFTER_MIGRATION = `after_mig_${MIGRATION_NAME}`
const BEFORE_MIGRATION = `before_mig_${MIGRATION_NAME}`
const TIMEOUT = 30000

describe(MIGRATION_NAME, () => {
  test(
    'Should run each migrations up to the migration we are testing',
    async () => {
      await startMessagingServer(
        {
          command: `yarn start migrate up --target ${PREVIOUS_VERSION}`,
          launchTimeout: TIMEOUT
        },
        BEFORE_MIGRATION
      )
    },
    TIMEOUT
  )

  test(
    'Should run the migration without error',
    async () => {
      await startMessagingServer(
        {
          command: `yarn start migrate up --target ${MIGRATION_VERSION}`,
          launchTimeout: TIMEOUT
        },
        AFTER_MIGRATION
      )
    },
    TIMEOUT
  )

  test(
    'Should be able to revert the migration',
    async () => {
      await startMessagingServer(
        {
          command: `yarn start migrate down --target ${PREVIOUS_VERSION}`,
          launchTimeout: TIMEOUT
        },
        AFTER_MIGRATION
      )
    },
    TIMEOUT
  )

  test('Should have the same schemas', async () => {
    await compareDatabases(BEFORE_MIGRATION, AFTER_MIGRATION)
  })
})
