import { createDatabaseIfNotExists, getTestDataPath, randomLetters } from '@botpress/base-test/src'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

import { Engine } from '../../src'

export let engine: Engine
export const DEFAULT_VERSION = '0.0.0'

let env: NodeJS.ProcessEnv

export const setupApp = async (
  { prefix, transient }: { transient: boolean; prefix?: string } = { transient: true }
) => {
  env = { ...process.env }

  process.env.ENCRYPTION_KEY = Buffer.from('encryption_key_of_32_chars_long_').toString('base64')
  process.env.BATCHING_ENABLED = 'true'
  process.env.SKIP_LOAD_ENV = 'true'
  process.env.SUPPRESS_LOGGING = 'true'
  process.env.DATABASE_URL = process.env.DATABASE_URL || path.join(getTestDataPath(), `${prefix || uuidv4()}.sqlite`)

  if (process.env.DATABASE_URL.startsWith('postgres')) {
    // Transient means that the database will be cleared when destroyApp is called
    transient && (process.env.DATABASE_TRANSIENT = 'true')

    // Note: At this point, we should have received a connection URL that gives
    // us access to the whole database. We can then create databases with random
    // names to prevent having conflicts between tests
    const name = prefix || randomLetters(8)
    await createDatabaseIfNotExists(process.env.DATABASE_URL, name)

    process.env.DATABASE_URL = `${process.env.DATABASE_URL}/${name}`
  }

  engine = new Engine()

  engine.meta.setPkg({ version: DEFAULT_VERSION })

  await engine.setup()
  await engine.postSetup()
}

export const destroyApp = async () => {
  try {
    await engine.batching.destroy()
    await engine.distributed.destroy()
    await engine.database.destroy()
  } finally {
    process.env = env
  }
}
