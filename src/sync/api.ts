import { Router } from 'express'
import { BaseApi } from '../base/api'
import { SyncService } from './service'
import { SyncRequest } from './types'

export class SyncApi extends BaseApi {
  constructor(router: Router, private syncs: SyncService) {
    super(router)
  }

  async setup() {
    this.router.post('/sync', async (req, res) => {
      const sync = req.body as SyncRequest

      const result = await this.syncs.sync(sync)

      res.send(result)
    })
  }
}
