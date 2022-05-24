import { createDatabaseIfNotExists, getTestDataPath, randomLetters } from '@botpress/base-test/src'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { App } from '../../src/app'
import { Migrations } from '../../src/migrations'

export let app: App
let env: NodeJS.ProcessEnv

export const setupApp = async (
  { prefix, transient }: { transient: boolean; prefix?: string } = { transient: true }
) => {
  env = { ...process.env }

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

  app = new App()
  await app.prepare(require('../../package.json'), Migrations)
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
