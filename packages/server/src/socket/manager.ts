import clc from 'cli-color'
import { Server } from 'http'
import Socket from 'socket.io'
import { Logger } from '../logger/types'
import { SocketService } from './service'

export class SocketManager {
  private logger = new Logger('Socket')
  private handlers: { [type: string]: SocketHandler } = {}

  constructor(private sockets: SocketService) {}

  async setup(server: Server) {
    const ws = new Socket.Server(server, { cors: { origin: '*' } })
    ws.on('connection', this.handleSocketConnection.bind(this))
  }

  public handle(type: string, callback: SocketHandler) {
    this.handlers[type] = callback
  }

  public reply(socket: Socket.Socket, message: any, data: any) {
    socket.send({
      request: message.request,
      data
    })
  }

  private async handleSocketConnection(socket: Socket.Socket) {
    try {
      this.logger.debug(`${clc.blackBright(`[${socket.id}]`)} ${clc.bgBlue(clc.magentaBright('connection'))}`)

      await this.setupSocket(socket)
      this.sockets.create(socket)
    } catch (e) {
      this.logger.error(e, 'An error occurred during a socket connection')
    }
  }

  async setupSocket(socket: Socket.Socket) {
    socket.on('message', async (data) => {
      await this.handleSocketMessage(socket, data)
    })
    socket.on('disconnect', async (data) => {
      await this.handleSocketDisconnect(socket, data)
    })
  }

  private async handleSocketMessage(socket: Socket.Socket, data: any) {
    try {
      this.logger.debug(`${clc.blackBright(`[${socket.id}]`)} ${clc.magenta('message')}`, data)
      await this.handlers[data?.type]?.(socket, data)
    } catch (e) {
      this.logger.error(e, 'An error occured receiving a socket message', data)
    }
  }

  private async handleSocketDisconnect(socket: Socket.Socket, data: any) {
    try {
      this.logger.debug(`${clc.blackBright(`[${socket.id}]`)} ${clc.bgBlack(clc.magenta('disconnect'))}`)
      this.sockets.delete(socket)
    } catch (e) {
      this.logger.error(e, 'An error occured during a socket disconnect')
    }
  }
}

export type SocketHandler = (socket: Socket.Socket, data: any) => Promise<any>
