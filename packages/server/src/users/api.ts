import { Router } from 'express'
import { ApiRequest, ClientScopedApi } from '../base/api'
import { ClientService } from '../clients/service'
import { SocketManager } from '../socket/manager'
import { UserService } from './service'

export class UserApi extends ClientScopedApi {
  constructor(router: Router, clients: ClientService, private sockets: SocketManager, private users: UserService) {
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

    this.sockets.handle('auth', async (socket, message: any) => {
      if (message.data.userId) {
        // TODO: check user token
        const user = await this.users.get(message.data.userId)
        if (user) {
          socket.emit('message', {
            request: message.request,
            type: 'auth',
            data: user
          })
        }
      }

      socket.emit('message', {
        request: message.request,
        type: 'auth',
        data: await this.users.create(message.data.clientId)
      })
    })
  }
}
