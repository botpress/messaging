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

  async handle(socket: Socket, message: any) {
    if (message.type === 'auth') {
      socket.emit('message', {
        request: message.request,
        type: 'auth',
        data: await this.users.create(message.data.clientId)
      })
    }
  }
}
