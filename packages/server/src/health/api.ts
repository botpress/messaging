import { Router } from 'express'
import { ApiRequest, ClientScopedApi } from '../base/api'
import { ClientService } from '../clients/service'
import { HealthService } from './service'

export class HealthApi extends ClientScopedApi {
  constructor(router: Router, clients: ClientService, private health: HealthService) {
    super(router, clients)
  }

  async setup() {
    this.router.use('/health', this.extractClient.bind(this))

    this.router.get(
      '/health',
      this.asyncMiddleware(async (req: ApiRequest, res) => {
        const health = await this.health.getHealthForClient(req.client!.id)
        res.send(health)
      })
    )
  }
}
