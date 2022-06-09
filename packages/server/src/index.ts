import { trace } from './tracing'
trace.init()

import './rewire'
import { Entry, start } from '@botpress/messaging-framework'
import { Api } from './api'
import { App } from './app'
import { Migrations } from './migrations'
import { Socket } from './socket'
import { Stream } from './stream'

export class Root extends Entry {
  get name() {
    return 'Botpress Messaging'
  }

  get port() {
    return 3100
  }

  get package() {
    return require('../package.json')
  }

  get migrations() {
    return Migrations
  }

  constructor() {
    super(App, Api, Stream, Socket)
  }
}

start(Root)
