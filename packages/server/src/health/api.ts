import { Response } from 'express'
import { ApiManager } from '../base/api-manager'
import { ClientApiRequest } from '../base/auth/client'
import { ReqSchema } from '../base/schema'
import { HealthService } from './service'

export class HealthApi {
  constructor(private health: HealthService) {}

  setup(router: ApiManager) {
    router.get('/health', ReqSchema(), this.get.bind(this))
  }

  async get(req: ClientApiRequest, res: Response) {
    const health = await this.health.getHealthForClient(req.clientId)
    res.send(health)
  }
}
