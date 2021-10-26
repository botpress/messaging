import { uuid } from '@botpress/messaging-base'
import { ClientService } from '../clients/service'
import { SocketManager, SocketRequest } from '../socket/manager'
import { SocketService } from '../socket/service'
import { UserTokenService } from '../user-tokens/service'
import { Schema } from './schema'
import { UserService } from './service'

export class UserSocket {
  constructor(
    private sockets: SocketManager,
    private clients: ClientService,
    private users: UserService,
    private userTokens: UserTokenService,
    private socketService: SocketService
  ) {}

  setup() {
    // TODO: this should be done when establishing the socket connection
    this.sockets.handle('users.auth', Schema.Socket.Auth, this.auth.bind(this), false)
    this.sockets.handle('users.get', Schema.Socket.Get, this.get.bind(this))
  }

  async auth(socket: SocketRequest) {
    const {
      clientId,
      userId,
      userToken: userTokenRaw
    }: { clientId: uuid; userId: uuid; userToken: string } = socket.data

    const client = await this.clients.getById(clientId)
    if (!client) {
      return socket.notFound('Client not found')
    }

    // TODO: refactor here

    let success = true
    let user = userId ? await this.users.get(userId) : undefined
    let token = undefined

    if (!user || user.clientId !== client.id) {
      success = false
    } else {
      const [userTokenId, userTokenToken] = userTokenRaw.split('.')
      if (!(await this.userTokens.verifyToken(userTokenId, userTokenToken))) {
        success = false
      }
    }

    if (!success) {
      user = await this.users.create(clientId)
      const tokenRaw = await this.userTokens.generateToken()
      const userToken = await this.userTokens.create(user.id, tokenRaw, undefined)
      token = `${userToken.id}.${tokenRaw}`
    }

    this.socketService.registerForUser(socket.socket, user!.id)
    socket.reply({ userId: user!.id, userToken: token })
  }

  async get(socket: SocketRequest) {
    socket.reply(await this.users.get(socket.userId))
  }
}
