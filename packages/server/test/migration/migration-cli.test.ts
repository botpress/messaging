import { getTableId } from '@botpress/messaging-engine'
import { Knex } from 'knex'
import portfinder from 'portfinder'

import { setupConnection } from './utils/database'
import { decrement, increment } from './utils/semver'
import { startMessagingServer } from './utils/server'

const pkg = require('../../package.json')

const CLI_MIGRATIONS = 'cli_migs'
const TIMEOUT = 30000

describe('Migration CLI', () => {
  let conn: Knex
  let isLite: boolean

  beforeAll(() => {
    const connectionInfo = setupConnection(CLI_MIGRATIONS)

    conn = connectionInfo.conn
    isLite = connectionInfo.isLite
  })

  afterAll(async () => {
    await conn.destroy()
  })

  const getLatestMetaVersion = async (): Promise<string | undefined> => {
    try {
      const meta = await conn(getTableId('msg_meta')).orderBy('time', 'desc').first()

      if (meta) {
        let data = meta.data

        if (isLite) {
          data = JSON.parse(meta.data)
        }

        return data.version
      }
    } catch {}
  }

  test(
    'Should apply no migration when in dry-run',
    async () => {
      await startMessagingServer(
        {
          command: 'yarn dev migrate up --dry',
          launchTimeout: TIMEOUT
        },
        CLI_MIGRATIONS
      )

      expect(await getLatestMetaVersion()).toBeUndefined()
    },
    TIMEOUT
  )

  test(
    'Should be able to auto migrate to the latest version',
    async () => {
      const current = pkg.version
      const port = await portfinder.getPortPromise()

      await startMessagingServer(
        {
          command: 'yarn dev --auto-migrate',
          launchTimeout: TIMEOUT,
          protocol: 'http',
          host: '127.0.0.1',
          port,
          path: 'status',
          usedPortAction: 'error'
        },
        CLI_MIGRATIONS
      )

      expect(await getLatestMetaVersion()).toEqual(current)
    },
    TIMEOUT
  )

  test(
    'Should be able to run all migrations at once',
    async () => {
      const target = '0.0.0'

      await startMessagingServer(
        {
          command: `yarn dev migrate down --target ${target}`,
          launchTimeout: TIMEOUT
        },
        CLI_MIGRATIONS
      )

      expect(await getLatestMetaVersion()).toBeUndefined()

      await startMessagingServer(
        {
          command: 'yarn dev migrate up',
          launchTimeout: TIMEOUT
        },
        CLI_MIGRATIONS
      )

      expect(await getLatestMetaVersion()).toEqual(pkg.version)
    },
    TIMEOUT * 2
  )

  test(
    'Should be able to migrate down to a given target',
    async () => {
      const target = decrement(pkg.version, 'minor')

      await startMessagingServer(
        {
          command: `yarn dev migrate down --target ${target}`,
          launchTimeout: TIMEOUT
        },
        CLI_MIGRATIONS
      )

      expect(await getLatestMetaVersion()).toEqual(target)
    },
    TIMEOUT
  )

  test(
    'Should be able to migrate up to a given target',
    async () => {
      const target = pkg.version

      await startMessagingServer(
        {
          command: `yarn dev migrate up --target ${target}`,
          launchTimeout: TIMEOUT
        },
        CLI_MIGRATIONS
      )

      expect(await getLatestMetaVersion()).toEqual(target)
    },
    TIMEOUT
  )

  test(
    'Should do nothing if migrate down has no target',
    async () => {
      await startMessagingServer(
        {
          command: 'yarn dev migrate down',
          launchTimeout: TIMEOUT
        },
        CLI_MIGRATIONS
      )

      expect(await getLatestMetaVersion()).toEqual(pkg.version)
    },
    TIMEOUT
  )

  test(
    'Should throw an error if migrate down has a target higher than the current version',
    async () => {
      const current = pkg.version
      const target = increment(pkg.version)

      await expect(
        startMessagingServer(
          {
            command: `yarn dev migrate down --target ${target}`,
            launchTimeout: TIMEOUT
          },
          CLI_MIGRATIONS
        )
      ).rejects.toThrow(
        ` Invalid migration parameters: down migration cannot target a version (${target}) higher than the current server version (${current}).`
      )
    },
    TIMEOUT
  )

  test(
    'Should throw an error if migrate up has a target lower than the current version',
    async () => {
      const current = pkg.version
      const target = decrement(pkg.version)

      await expect(
        startMessagingServer(
          {
            command: `yarn dev migrate up --target ${target}`,
            launchTimeout: TIMEOUT
          },
          CLI_MIGRATIONS
        )
      ).rejects.toThrow(
        ` Invalid migration parameters: up migration cannot target a version (${target}) lower than the current server version (${current}).`
      )
    },
    TIMEOUT
  )

  test(
    'Should throw an error if migrate up has a target higher than the application version',
    async () => {
      const current = pkg.version
      const target = increment(pkg.version)

      await expect(
        startMessagingServer(
          {
            command: `yarn dev migrate up --target ${target}`,
            launchTimeout: TIMEOUT
          },
          CLI_MIGRATIONS
        )
      ).rejects.toThrow(
        ` Invalid migration parameters: up migration cannot target a version (${target}) higher than the application version (${current}).`
      )
    },
    TIMEOUT
  )

  test(
    'Should throw an error if target is invalid',
    async () => {
      const target = 'invalid_target'

      await expect(
        startMessagingServer(
          {
            command: `yarn dev migrate up --target ${target}`,
            launchTimeout: TIMEOUT
          },
          CLI_MIGRATIONS
        )
      ).rejects.toThrow(` Error occurred starting server. TypeError: Invalid Version: ${target}`)
    },
    TIMEOUT
  )
})
