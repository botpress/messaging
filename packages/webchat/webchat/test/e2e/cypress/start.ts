import { setupServer, teardownServer, runCommand } from '@botpress/testing'
import path from 'path'
import portfinder from 'portfinder'

const setup = async () => {
  // We need to reset ts-node compiler options used to run this file so
  // that it does not conflict with the one for the projects we want to start
  process.env.TS_NODE_COMPILER_OPTIONS = '{}'

  const debug = process.env.DEBUG === 'true'
  const port = await portfinder.getPortPromise()

  console.info('Starting the Webchat and Messaging server...')
  await setupServer([
    {
      debug,
      command: 'yarn workspace @botpress/webchat dev',
      launchTimeout: 60000,
      protocol: 'http',
      host: '127.0.0.1',
      port: 1234 // We use the default port for the webchat
    },
    {
      debug,
      command: `PORT=${port} yarn workspace @botpress/messaging-server dev`,
      launchTimeout: 60000,
      protocol: 'http',
      host: '127.0.0.1',
      port,
      path: 'status'
    }
  ])

  try {
    // We discard the first two arguments since they are the node binary and the script paths
    const args = process.argv.slice(2).join(' ')
    const cwd = path.join(__dirname, '../')

    // More on handling environment variables with Cypress:
    // https://docs.cypress.io/guides/guides/environment-variables#Option-3-CYPRESS_
    await runCommand({
      command: `CYPRESS_MESSAGING_ENDPOINT=http://localhost:${port} yarn run -T cross-env HEIGHT=1080 WIDTH=1920 cypress run --project ${cwd} ${args}`,
      debug: true
    })
  } catch (e) {
    console.error(e)
  } finally {
    await teardownServer()
  }
}

void setup()
