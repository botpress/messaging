import './rewire'
import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import yargs from 'yargs'
import yn from 'yn'
import { Api } from './api'
import { App } from './app'
import { Launcher } from './launcher'
import { Socket } from './socket'
import { Stream } from './stream'

// Set NODE_ENV to production when starting messaging using the binary version
process.env.NODE_ENV = process.pkg ? 'production' : process.env.NODE_ENV

const launch = async () => {
  await setupEnv()

  const router = express()
  router.disable('x-powered-by')

  const app = new App()
  const api = new Api(app, router)
  const stream = new Stream(app)
  const socket = new Socket(app)

  const launcher = new Launcher(router, app, api, stream, socket)
  await launcher.launch()
}

const setupEnv = async () => {
  if (yn(process.env.SKIP_LOAD_ENV)) {
    return
  }

  if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: path.resolve(process.cwd(), 'dist', '.env') })
  } else {
    dotenv.config()
  }
}

void yargs
  .scriptName('')
  .command(
    ['$0', 'serve'],
    'Start server',
    (yargs) => {
      return yargs.options({ autoMigrate: { type: 'boolean', default: false } })
    },
    async (argv) => {
      if (argv.autoMigrate) {
        process.env.AUTO_MIGRATE = 'true'
      }

      await launch()
    }
  )
  .command('migrate', 'Migrate database', (yargs) => {
    const start = async (cmd: string, target: string, dry: boolean) => {
      process.env.AUTO_MIGRATE = 'true'
      if (cmd) {
        process.env.MIGRATE_CMD = cmd
      }
      if (target) {
        process.env.MIGRATE_TARGET = target
      }
      if (dry) {
        process.env.MIGRATE_DRYRUN = 'true'
      }
      await launch()
    }

    return yargs
      .command('up', 'Migrate to the latest version (unless --target is specified)', {}, async (argv) => {
        await start('up', argv.target as string, argv.dry as boolean)
      })
      .command('down', 'Downgrade to a previous version (--target must be specified)', {}, async (argv) => {
        await start('down', argv.target as string, argv.dry as boolean)
      })
      .option('target', {
        alias: 't',
        describe: 'Target a specific version'
      })
      .option('dryrun', {
        alias: 'dry',
        describe: 'Displays the list of migrations that will be executed, without applying the changes'
      })
  }).argv
