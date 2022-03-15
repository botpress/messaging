import { Server } from 'http'
import { App } from './app'

// TODO: add some example socket routes

export class Socket {
  constructor(app: App) {}

  async setup() {}

  async start(server: Server) {}

  async destroy() {}
}
