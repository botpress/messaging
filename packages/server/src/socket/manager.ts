import { uuid } from '@botpress/messaging-base'
import { Logger } from '@botpress/messaging-engine'
import clc from 'cli-color'
import { Server } from 'http'
import Joi from 'joi'
import Socket from 'socket.io'
import yn from 'yn'
import { ClientService } from '../clients/service'
import { UserTokenService } from '../user-tokens/service'
import { UserService } from '../users/service'
import { Schema } from './schema'
import { SocketService } from './service'

export class SocketManager {
  private logger = new Logger('Socket')
  private ws: Socket.Server | undefined
  private handlers: { [type: string]: SocketHandler } = {}

  constructor(
    private clients: ClientService,
    private users: UserService,
    private userTokens: UserTokenService,
    private sockets: SocketService
  ) {}

  async setup(server: Server) {
    if (yn(process.env.DISABLE_SOCKETS)) {
      return
    }

    this.ws = new Socket.Server(server, { serveClient: false, cors: { origin: '*' } })
    this.ws.use(this.handleSocketAuthentication.bind(this))
    this.ws.on('connection', this.handleSocketConnection.bind(this))
  }

  async destroy() {
    await new Promise((resolve, reject) => {
      if (!this.ws) {
        return resolve(undefined)
      }
      // This is kind of hack to make sure that socket.io does not
      // try to close the HTTP server before http-terminator
      this.ws['httpServer'] = undefined

      this.ws.close((err) => {
        if (err) {
          this.logger.error(err, 'An error occurred when closing the websocket server.')
        }

        resolve(undefined)
      })
    })
  }

  public handle(type: string, schema: Joi.ObjectSchema<any>, callback: (socket: SocketRequest) => Promise<void>) {
    this.handlers[type] = async (socket: Socket.Socket, message: SocketMessage) => {
      const userId = this.sockets.getUserId(socket)
      if (!userId) {
        return this.reply(socket, message, {
          error: true,
          message: 'socket does not have user rights'
        })
      }
      message.userId = userId

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

  private async handleSocketAuthentication(socket: Socket.Socket, next: (err?: Error) => void) {
    try {
      const { error } = Schema.Socket.Auth.validate(socket.handshake.auth)
      if (error) {
        return next(new Error(error.message))
      }

      const { clientId, creds } = socket.handshake.auth as {
        clientId: uuid
        creds?: { userId: uuid; userToken: string }
      }

      const client = await this.clients.fetchById(clientId)
      if (!client) {
        return next(new Error('Client not found'))
      }

      if (creds) {
        const user = await this.users.fetch(creds.userId)
        if (user?.clientId === clientId && (await this.userTokens.verifyToken(user.id, creds.userToken))) {
          socket.data.creds = creds
          // we don't need to send it back if it was already sent to us
          delete socket.data.creds.userToken
          return next()
        }
      }

      const user = await this.users.create(clientId)
      const tokenRaw = await this.userTokens.generateToken()
      const userToken = await this.userTokens.create(user.id, tokenRaw, undefined)
      socket.data.creds = { userId: user.id, userToken: `${userToken.id}.${tokenRaw}` }

      next()
    } catch (e) {
      this.logger.error(e, 'An error occurred when authenticating a socket connection')

      next(new Error('an error occurred authenticating socket'))
    }
  }

  private async handleSocketConnection(socket: Socket.Socket) {
    try {
      this.logger.debug(`${clc.blackBright(`[${socket.id}]`)} ${clc.bgBlue(clc.magentaBright('connection'))}`)

      const { creds } = socket.data
      delete socket.data.creds

      await this.setupSocket(socket)
      await this.sockets.create(socket, creds.userId)

      socket.emit('login', creds)
    } catch (e) {
      this.logger.error(e, 'An error occurred during a socket connection')
    }
  }

  async setupSocket(socket: Socket.Socket) {
    socket.on('message', (data) => {
      void this.handleSocketMessage(socket, data)
    })
    socket.on('disconnect', () => {
      void this.handleSocketDisconnect(socket)
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

      try {
        return this.reply(socket, message, { error: true, message: 'an error occurred' })
      } catch (e) {
        this.logger.error(e, 'An error occured sending an error message to the socket')
      }
    }
  }

  private async handleSocketDisconnect(socket: Socket.Socket) {
    try {
      this.logger.debug(`${clc.blackBright(`[${socket.id}]`)} ${clc.bgBlack(clc.magenta('disconnect'))}`)
      await this.sockets.delete(socket)
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
