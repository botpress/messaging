import { uuid } from '@botpress/messaging-base'
import clc from 'cli-color'
import { Server } from 'http'
import Joi from 'joi'
import Socket from 'socket.io'
import yn from 'yn'
import { Logger } from '../logger/types'
import { SocketService } from './service'

export class SocketManager {
  private logger = new Logger('Socket')
  private ws: Socket.Server | undefined
  private handlers: { [type: string]: SocketHandler } = {}

  constructor(private sockets: SocketService) {}

  async setup(server: Server) {
    if (yn(process.env.ENABLE_EXPERIMENTAL_SOCKETS)) {
      this.ws = new Socket.Server(server, { serveClient: false, cors: { origin: '*' } })
      this.ws.on('connection', this.handleSocketConnection.bind(this))
    }
  }

  async destroy() {
    if (!this.ws) {
      return
    }

    await new Promise((resolve, reject) => {
      // This is kind of hack to make sure that socket.io does not
      // try to close the HTTP server before http-terminator
      this.ws!['httpServer'] = undefined

      this.ws!.close((err) => {
        if (err) {
          this.logger.error(err, 'An error occurred when closing the websocket server.')
        }

        resolve(undefined)
      })
    })
  }

  public handle(
    type: string,
    schema: Joi.ObjectSchema<any>,
    callback: (socket: SocketRequest) => Promise<void>,
    checkUserId?: boolean
  ) {
    this.handlers[type] = async (socket: Socket.Socket, message: SocketMessage) => {
      // TODO: remove this
      if (checkUserId !== false) {
        const userId = this.sockets.getUserId(socket)
        if (!userId) {
          return this.reply(socket, message, {
            error: true,
            message: 'socket does not have user rights'
          })
        }
        message.userId = userId
      }

      const { error } = schema.validate(message.data)
      if (error) {
        return this.reply(socket, message, { error: true, message: error.message })
      }

      await callback(new SocketRequest(this, socket, message, message.userId))
    }
  }

  public reply(socket: Socket.Socket, message: SocketMessage, data: any) {
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
    socket.on('disconnect', async () => {
      await this.handleSocketDisconnect(socket)
    })
  }

  private async handleSocketMessage(socket: Socket.Socket, message: SocketMessage) {
    try {
      this.logger.debug(`${clc.blackBright(`[${socket.id}]`)} ${clc.magenta('message')}`, message)

      if (!this.handlers[message.type]) {
        return this.reply(socket, message, { error: true, message: `route ${message.type} does not exist` })
      }

      await this.handlers[message.type](socket, message)
    } catch (e) {
      this.logger.error(e, 'An error occured receiving a socket message', message)

      return this.reply(socket, message, { error: true, message: 'an error occurred' })
    }
  }

  private async handleSocketDisconnect(socket: Socket.Socket) {
    try {
      this.logger.debug(`${clc.blackBright(`[${socket.id}]`)} ${clc.bgBlack(clc.magenta('disconnect'))}`)
      this.sockets.delete(socket)
    } catch (e) {
      this.logger.error(e, 'An error occured during a socket disconnect')
    }
  }
}

export type SocketHandler = (socket: Socket.Socket, data: SocketMessage) => Promise<void>

export interface SocketMessage {
  request: string
  type: string
  data: any
  userId: uuid
}

export class SocketRequest {
  public get data() {
    return this.message.data
  }

  public constructor(
    private manager: SocketManager,
    public readonly socket: Socket.Socket,
    private message: SocketMessage,
    public readonly userId: uuid
  ) {}

  public reply(data: any) {
    this.manager.reply(this.socket, this.message, data)
  }

  public forbid(message: string) {
    this.manager.reply(this.socket, this.message, { error: true, message })
  }

  public notFound(message: string) {
    this.manager.reply(this.socket, this.message, { error: true, message })
  }
}
