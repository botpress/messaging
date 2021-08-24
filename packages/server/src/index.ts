import './rewire'
import express from 'express'
import yargs from 'yargs'
import { Api } from './api'
import { App } from './app'
import { Launcher } from './launcher'

// Set NODE_ENV to production when starting messaging using the binary version
process.env.NODE_ENV = (<any>process).pkg ? 'production' : process.env.NODE_ENV

const launch = async () => {
  const router = express()

  const app = new App()
  const api = new Api(app, router)

  const launcher = new Launcher(router, app, api)
  await launcher.launch()
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
        describe: 'Displays the list of migrations that will be executed, without running them'
      })
  }).argv
