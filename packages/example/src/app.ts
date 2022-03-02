import { Framework } from '@botpress/framework'
import { HouseService } from './houses/service'

export class App extends Framework {
  houses: HouseService

  constructor() {
    super()
    this.houses = new HouseService(this.database)
  }

  async setup() {
    await super.setup()
    await this.houses.setup()
  }
}
