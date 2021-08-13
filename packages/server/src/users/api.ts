import { Router } from 'express'
import { Socket } from 'socket.io'
import { ApiRequest, ClientScopedApi } from '../base/api'
import { ClientService } from '../clients/service'
import { UserService } from './service'

export class UserApi extends ClientScopedApi {
  constructor(router: Router, clients: ClientService, private users: UserService) {
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
  }

  async handle(socket: Socket, message: SocketRequest<SocketUserAuthRequest>) {
    if (message.type === 'auth') {
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
    }
  }
}

interface SocketRequest<T> {
  request: string
  type: string
  data: T
}

interface SocketUserAuthRequest {
  clientId: string
  userId?: string
  userToken?: string
}
