import { Router } from 'express'
import { BaseApi } from '../base/api'
import { ProviderService } from '../providers/service'
import { Provider } from './types'

export class ProviderApi extends BaseApi {
  constructor(router: Router, private providers: ProviderService) {
    super(router)
  }

  async setup() {
    this.router.get('/providers', async (req, res) => {
      const { name, id } = req.query

      let provider: Provider | undefined = undefined
      if (name) {
        provider = await this.providers.getByName(name as string)
      } else if (id) {
        provider = await this.providers.getById(id as string)
      }

      if (provider) {
        res.send(provider)
      } else {
        res.sendStatus(404)
      }
    })

    this.router.post('/providers', async (req, res) => {
      const { name } = req.body

      const provider = await this.providers.create(undefined, name)

      res.send(provider)
    })
  }
}
