import { Router } from 'express'
import { BaseApi } from '../base/api'
import { ClientService } from './service'

export class ClientApi extends BaseApi {
  constructor(router: Router, private clients: ClientService) {
    super(router)
  }

  async setup() {
    this.router.post('/clients', async (req, res) => {
      const { providerId } = req.body

      const token = await this.clients.generateToken()
      const client = await this.clients.create(providerId, token)

      res.send({ id: client.id, token })
    })
  }
}
