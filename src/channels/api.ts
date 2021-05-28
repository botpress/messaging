import { Router } from 'express'
import { App } from '../app'

export class ChannelApi {
  constructor(private router: Router, private app: App) {}

  async setup() {
    for (const channel of this.app.channels.list()) {
      await channel.setup(this.app, this.router)
    }
  }
}
