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

yargs.scriptName('')

yargs.command({
  command: ['$0', 'serve'],
  describe: 'Run messaging server',
  builder: (d) => {
    return d.options({ autoMigrate: { type: 'boolean', default: false } })
  },
  handler: async (argv) => {
    if (argv.autoMigrate) {
      process.env.AUTO_MIGRATE = 'true'
    }

    await launch()
  }
})

yargs.command({
  command: 'migrate',
  describe: 'Migrate database',
  handler: async () => {
    await launch()
  }
})

void yargs.argv
