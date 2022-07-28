/* eslint-disable import/order */
import { init } from '@bpinternal/trail'
init()

import './rewire'
import { Entry, start } from '@botpress/messaging-framework'
import { Api } from './api'
import { App } from './app'
import { Migrations } from './migrations'
import { Socket } from './socket'
import { Stream } from './stream'
/* eslint-enable import/order */

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
