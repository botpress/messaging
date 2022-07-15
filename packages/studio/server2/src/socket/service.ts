import { Service } from '@botpress/framework'
import { Socket } from 'socket.io'

export class SocketService extends Service {
  private sockets: { [socketId: string]: SocketState | undefined } = {}

  async setup() {}

  public async create(socket: Socket) {
    const state = { socket }
    this.sockets[socket.id] = state
  }

  public async delete(socket: Socket) {
    this.sockets[socket.id] = undefined
  }
}

export interface SocketState {
  socket: Socket
}
