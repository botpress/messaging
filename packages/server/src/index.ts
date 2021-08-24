import './rewire'
import express from 'express'
import yargs from 'yargs'
import { Api } from './api'
import { App } from './app'
import { Launcher } from './launcher'

// Set NODE_ENV to production when starting messaging using the binary version
process.env.NODE_ENV = (<any>process).pkg ? 'production' : process.env.NODE_ENV

void yargs.command(
  '$0',
  'Start server',
  () => {},
  async () => {
    const router = express()

    const app = new App()
    const api = new Api(app, router)

    const launcher = new Launcher(router, app, api)
    await launcher.launch()
  }
).argv
