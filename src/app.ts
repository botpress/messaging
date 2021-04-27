import { Router } from 'express'
import { ChannelService } from './channels/service'
import { ConfigService } from './config/service'

export class App {
  config: ConfigService
  channels: ChannelService

  constructor(private router: Router) {
    this.config = new ConfigService()
    this.channels = new ChannelService(this.config, this.router)
  }

  setup() {
    this.config.setup()
    this.channels.setup()
  }
}
