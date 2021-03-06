import './rewire'
;(global as any)['NativePromise'] = global.Promise

import clc from 'cli-color'
import path from 'path'
import yn from 'yn'
import { Debug } from './debug'
import { BotpressEnvironmentVariables } from './global'

export function getAppDataPath() {
  const homeDir = process.env.HOME || process.env.APPDATA
  if (homeDir) {
    if (process.platform === 'darwin') {
      return path.join(homeDir, 'Library', 'Application Support', 'botpress')
    }

    return path.join(homeDir, 'botpress')
  }

  console.error(
    clc.red(`Could not determine your HOME directory.
Please set the environment variable "APP_DATA_PATH", then start Botpress`)
  )
  process.exit()
}

const printPlainError = (err: any) => {
  /* eslint-disable no-console */
  console.log('Error starting botpress')
  console.log(err)
  console.log(err.message)
  console.log('---STACK---')
  console.log(err.stack)
}

;(global as any).DEBUG = Debug
;(global as any).printErrorDefault = printPlainError

if (process.env.APP_DATA_PATH) {
  process.APP_DATA_PATH = process.env.APP_DATA_PATH
} else {
  process.APP_DATA_PATH = getAppDataPath()
}

process.IS_FAILSAFE = yn(process.env.BP_FAILSAFE) || false
process.LOADED_MODULES = {}

process.STUDIO_LOCATION = process.pkg
  ? path.dirname(process.execPath) // We point at the binary path
  : path.resolve(__dirname) // e.g. /dist/..

// process.DATA_LOCATION = path.resolve(process.PROJECT_LOCATION, './data')

process.on('unhandledRejection', (err: any) => {
  console.trace(err)
  printErrorDefault(err)

  if (!process.IS_FAILSAFE) {
    process.exit(1)
  }
})

process.on('uncaughtException', (err) => {
  printErrorDefault(err)
  if (!process.IS_FAILSAFE) {
    process.exit(1)
  }
})

try {
  require('dotenv').config({ path: path.resolve(process.cwd(), '.env') })
  process.core_env = process.env as BotpressEnvironmentVariables

  let defaultVerbosity = process.IS_PRODUCTION ? 0 : 2
  if (!isNaN(Number(process.env.VERBOSITY_LEVEL))) {
    defaultVerbosity = Number(process.env.VERBOSITY_LEVEL)
  }

  const localCloud = yn(process.env.CLOUD_LOCAL)
  process.CLOUD_CONTROLLER_ENDPOINT =
    process.env.CLOUD_CONTROLLER_ENDPOINT ||
    (localCloud ? 'http://localhost:3600' : 'https://controllerapi.botpress.dev')
  process.CLOUD_OAUTH_ENDPOINT =
    process.env.CLOUD_OAUTH_ENDPOINT ||
    (localCloud ? 'http://localhost:4444/oauth2/token' : 'https://oauth.botpress.dev/oauth2/token')
  process.CLOUD_NLU_ENDPOINT =
    process.env.CLOUD_NLU_ENDPOINT || (localCloud ? 'http://localhost:3200' : 'https://nlu-builder.botpress.dev')

  process.STUDIO_VERSION = '13.0.0'

  require('yargs')
    .command(
      ['serve', '$0'],
      'Start botpress studio server',
      {
        dataFolder: {
          alias: ['d', 'data'],
          description: 'Starts Botpress in standalone mode on that specific data folder',
          type: 'string'
        }
      },
      async (argv: any) => {
        if (process.env.BP_DATA_FOLDER) {
          process.DATA_LOCATION = process.env.BP_DATA_FOLDER
        } else if (argv.dataFolder) {
          process.IS_PRODUCTION = false

          process.DATA_LOCATION = path.resolve(argv.dataFolder)
        } else {
          console.error(
            "Data folder must be provided. Either set the environment variable 'BP_DATA_FOLDER' or start the binary with 'studio.exe -d /path/to/data' "
          )
          process.exit(1)
        }

        process.VERBOSITY_LEVEL = defaultVerbosity

        require('./bootstrap')
      }
    )
    .help().argv
} catch (err: any) {
  printErrorDefault(err)
}
