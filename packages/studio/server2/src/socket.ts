import { Server } from 'http'
import { App } from './app'

export class Socket {
  constructor(app: App) {}

  async setup() {}

  async start(server: Server) {}

  async destroy() {}
}
