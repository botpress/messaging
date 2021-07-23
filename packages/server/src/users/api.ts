import { Router } from 'express'
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
}
