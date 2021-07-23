import { Router } from 'express'
import { App } from '../app'
import { BaseApi } from '../base/api'

export class ChannelApi extends BaseApi {
  constructor(router: Router, private app: App) {
    super(router)
  }

  async setup() {
    for (const channel of this.app.channels.list()) {
      await channel.setup(this.app, this.router)
    }
  }
}
