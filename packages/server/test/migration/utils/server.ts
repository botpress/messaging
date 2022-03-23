import { spawn } from 'child_process'
import clc from 'cli-color'
import { JestDevServerOptions, setup, teardown } from 'jest-dev-server'
import path from 'path'

const errorDelimiters = clc.red('red').split('red')
const isError = (str: string) => str.includes(errorDelimiters[0]) && str.includes(errorDelimiters[1])
const extractError = (str: string) => {
  const info = str.split(errorDelimiters[1])

  return info[info.length - 1].trim()
}

export const startMessagingServer = async (options: JestDevServerOptions, prefix: string) => {
  process.env.SKIP_LOAD_ENV = 'true'
  process.env.DATABASE_URL =
    process.env.DATABASE_URL || path.join(__dirname, './../../../../../test/.test-data', `${prefix}.sqlite`)

  if (process.env.DATABASE_URL!.startsWith('postgres')) {
    process.env.DATABASE_SUFFIX = prefix
  }

  process.env.PORT = options.port?.toString() || '3100'

  if (options.path) {
    await setup(options)

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

      // Since we don't write to stderr when logging,
      // we have to manually extract the error so we
      // can accelerate debugging if something does wrong
      // with the subprocess.
      const errors: string[] = []
      server.stdout.on('data', (data) => {
        const str: string = data.toString()

        if (isError(str)) {
          errors.push(extractError(str))
        }
      })

      server.on('close', (code) => {
        if (code === 0 && errors.length === 0) {
          resolve(undefined)
        } else {
          reject(new Error(errors.join('\n')))
        }
      })
    })
  }
}
