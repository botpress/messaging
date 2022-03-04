import { spawn } from 'child_process'
import { JestDevServerOptions, setup, teardown } from 'jest-dev-server'
import path from 'path'

export const startMessagingServer = async (options: JestDevServerOptions, prefix: string) => {
  const defaultEnv = { ...process.env }

  process.env.SKIP_LOAD_ENV = 'true'
  process.env.DATABASE_URL =
    process.env.DATABASE_URL || path.join(__dirname, './../../../../../test/.test-data', `${prefix}.sqlite`)

  if (process.env.DATABASE_URL!.startsWith('postgres')) {
    process.env.DATABASE_SUFFIX = prefix
  }

  process.env.PORT = options.port?.toString() || '3100'

  if (options.path) {
    await setup(options)

    process.env = defaultEnv

    return teardown()
  } else {
    // Spawn a process and wait for it to complete.
    // Note: We have to manually spawn the process since
    // jest-dev-server doesn't wait for it to complete
    return new Promise((resolve, reject) => {
      const server = spawn(options.command, {
        env: process.env,
        shell: true,
        cwd: __dirname
      })

      if (options.debug) {
        server.stdout.pipe(process.stdout)
      }
      server.stderr.pipe(process.stderr)

      server.on('close', (code) => {
        process.env = defaultEnv

        if (code === 0) {
          resolve(undefined)
        } else {
          reject()
        }
      })
    })
  }
}
