import {
  ServerOptions,
  setupServer,
  teardownServer,
  runCommand,
  getTestDataPath,
  createDatabaseIfNotExists
} from '@botpress/base-test/src'
import path from 'path'

export const startMessagingServer = async (options: ServerOptions, prefix: string) => {
  const envCopy = { ...process.env }

  process.env.SKIP_LOAD_ENV = 'true'
  process.env.DATABASE_URL = process.env.DATABASE_URL || path.join(getTestDataPath(), `${prefix}.sqlite`)

  if (process.env.DATABASE_URL!.startsWith('postgres') && prefix.length) {
    await createDatabaseIfNotExists(process.env.DATABASE_URL, prefix)

    process.env.DATABASE_URL = `${process.env.DATABASE_URL}/${prefix}`
  }

  process.env.PORT = options.port?.toString() || '3100'

  try {
    if (options.path) {
      await setupServer(options)

      return teardownServer()
    } else {
      return runCommand(options)
    }
  } finally {
    process.env = envCopy
  }
}

export const buildMessagingServer = async (options: Pick<ServerOptions, 'command' | 'launchTimeout'>) => {
  await startMessagingServer(options as ServerOptions, '')
}
