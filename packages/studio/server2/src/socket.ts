import { Server } from 'http'
import { App } from './app'
import { SocketManager } from './socket/manager'

export class Socket {
  private manager: SocketManager

  constructor(app: App) {
    this.manager = new SocketManager(app.sockets)
  }

  async setup() {}

  async start(server: Server) {
    await this.manager.setup(server)
  }

  async destroy() {
    await this.manager.destroy()
  }
}
