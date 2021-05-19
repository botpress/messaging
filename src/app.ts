import { Router } from 'express'
import { ChannelService } from './channels/service'
import { ConfigService } from './config/service'
import { DatabaseService } from './database/service'

export class App {
  config: ConfigService
  database: DatabaseService
  channels: ChannelService

  constructor(private router: Router) {
    this.config = new ConfigService()
    this.database = new DatabaseService(this.config)
    this.channels = new ChannelService(this.config, this.router)
  }

  setup() {
    this.config.setup()
    this.database.setup()
    this.channels.setup()
  }
}
