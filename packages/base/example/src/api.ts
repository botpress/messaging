import { ApiManagers, ClientApiRequest, ReqSchema } from '@botpress/framework'
import { Response } from 'express'
import { App } from './app'
import { HouseApi } from './houses/api'

export class Api {
  private houses: HouseApi

  constructor(private app: App, private managers: ApiManagers) {
    this.houses = new HouseApi(this.app.houses)
  }

  async setup() {
    this.houses.setup(this.managers.client)

    this.managers.client.get('/test', ReqSchema({}), this.test.bind(this))
  }

  async test(req: ClientApiRequest, res: Response) {
    res.sendStatus(200)
  }
}
