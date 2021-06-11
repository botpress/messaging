import express, { Router } from 'express'
import { ProviderService } from '../providers/service'
import { ClientService } from './service'

export class ClientApi {
  constructor(private router: Router, private providers: ProviderService, private clients: ClientService) {}

  async setup() {
    this.router.use('/clients', express.json())

    this.router.post('/clients', async (req, res) => {
      const { providerId } = req.body

      const token = await this.clients.generateToken()
      const client = await this.clients.create(providerId, token)

      res.send({ id: client.id, token })
    })
  }
}
