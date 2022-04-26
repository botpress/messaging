import { spawn } from 'child_process'
import path from 'path'
import { setup as setupDevServer, teardown as teardownDevServer } from 'jest-dev-server'
import portfinder from 'portfinder'

// TODO: Extract this in a util as it is mostly copied from the migration test utils
const execute = async (command: string, options: { debug: boolean } = { debug: false }) => {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, {
      env: process.env,
      shell: true,
      cwd: path.join(__dirname, '../../')
    })

    if (options.debug) {
      proc.stdout.pipe(process.stdout)
    }

    proc.stderr.pipe(process.stderr)

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(undefined)
      } else {
        reject(new Error(`Process exited with a non zero code: ${code}`))
      }
    })
  })
}

const setup = async () => {
  // We need to reset ts-node compiler options used to run this file so
  // that it does not conflict with the one for the projects we want to start
  process.env.TS_NODE_COMPILER_OPTIONS = '{}'

  const debug = process.env.DEBUG === 'true'
  const port = await portfinder.getPortPromise()

  console.info('Starting the Webchat and Messaging server...')
  await setupDevServer([
    {
      debug,
      command: 'yarn workspace @botpress/webchat dev',
      launchTimeout: 60000,
      protocol: 'http',
      host: '127.0.0.1',
      port: 1234, // We use the default port for the webchat
      usedPortAction: 'error'
    },
    {
      debug,
      command: `PORT=${port} yarn workspace @botpress/messaging-server dev`,
      launchTimeout: 60000,
      protocol: 'http',
      host: '127.0.0.1',
      port,
      path: 'status',
      usedPortAction: 'error'
    }
  ])

  try {
    // We discard the first two arguments since they are the node binary and the script paths
    const args = process.argv.slice(2).join(' ')
    // More on handling environment variables with Cypress:
    // https://docs.cypress.io/guides/guides/environment-variables#Option-3-CYPRESS_
    await execute(
      `CYPRESS_MESSAGING_ENDPOINT=http://localhost:${port} yarn run cross-env HEIGHT=1080 WIDTH=1920 cypress run ${args}`,
      { debug: true }
    )
  } finally {
    await teardownDevServer()
  }
}

void setup()
