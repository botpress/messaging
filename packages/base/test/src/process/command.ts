import { spawn } from 'child_process'
import clc from 'cli-color'
import { ServerOptions } from './interfaces'

const errorDelimiters = clc.red('red').split('red')
const isError = (str: string) => str.includes(errorDelimiters[0]) && str.includes(errorDelimiters[1])
const extractError = (str: string) => {
  const info = str.split(errorDelimiters[1])

  return info[info.length - 1].trim()
}

export const runCommand = async (options: Pick<ServerOptions, 'command' | 'debug'>) => {
  // Spawn a process and wait for it to complete.
  return new Promise((resolve, reject) => {
    const server = spawn(options.command, {
      env: process.env,
      shell: true,
      cwd: __dirname
    })

    if (options.debug) {
      server.stdout.pipe(process.stdout)
    }

    // Since we don't write to stderr when logging in the messaging server,
    // we have to manually extract the error so we can accelerate debugging
    // if something goes wrong with the subprocess.
    const errors: string[] = []
    server.stdout.on('data', (data) => {
      const str: string = data.toString()

      // TODO: Remove this once we write errs in the stderr on the Messaging Server
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
