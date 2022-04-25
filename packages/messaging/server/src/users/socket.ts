import { SocketManager, SocketRequest } from '../socket/manager'
import { Schema } from './schema'
import { UserService } from './service'

export class UserSocket {
  constructor(private sockets: SocketManager, private users: UserService) {}

  setup() {
    this.sockets.handle('users.get', Schema.Socket.Get, this.get.bind(this))
  }

  async get(socket: SocketRequest) {
    socket.reply(await this.users.get(socket.userId))
  }
}
