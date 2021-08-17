import { Router } from 'express'
import { ApiRequest, ClientScopedApi } from '../base/api'
import { ClientService } from '../clients/service'
import { SocketManager } from '../socket/manager'
import { SocketService } from '../socket/service'
import { AuthUserSocketSchema } from './schema'
import { UserService } from './service'

export class UserApi extends ClientScopedApi {
  constructor(
    router: Router,
    clients: ClientService,
    private sockets: SocketManager,
    private users: UserService,
    private socketService: SocketService
  ) {
    super(router, clients)
  }

  async setup() {
    this.router.use('/users', this.extractClient.bind(this))

    this.router.post(
      '/users',
      this.asyncMiddleware(async (req: ApiRequest, res) => {
        const user = await this.users.create(req.client!.id)

        res.send(user)
      })
    )

    this.sockets.handle('users.auth', async (socket, message) => {
      const { error } = AuthUserSocketSchema.validate(message.data)
      if (error) {
        return this.sockets.reply(socket, message, { error: true, message: error.message })
      }

      const { clientId, userId, userToken } = message.data

      // TODO: use user token to validate user
      const user = userId
        ? (await this.users.get(userId)) || (await this.users.create(clientId))
        : await this.users.create(clientId)

      this.socketService.registerForUser(socket, user.id)
      this.sockets.reply(socket, message, user)
    })
  }
}
