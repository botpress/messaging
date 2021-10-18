import { Router } from 'express'
import { Auth } from '../base/auth/auth'
import { HealthService } from './service'

export class HealthApi {
  constructor(private router: Router, private auth: Auth, private health: HealthService) {}

  async setup() {
    this.router.get(
      '/health',
      this.auth.client.auth(async (req, res) => {
        const health = await this.health.getHealthForClient(req.client.id)
        res.send(health)
      })
    )
  }
}
