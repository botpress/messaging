import { Router } from 'express'
import { ChannelService } from './channels/service'
import { ConfigService } from './config/service'
import { DatabaseService } from './database/service'
import { KvsService } from './kvs/service'

export class App {
  config: ConfigService
  database: DatabaseService
  kvs: KvsService
  channels: ChannelService

  constructor(private router: Router) {
    this.config = new ConfigService()
    this.database = new DatabaseService(this.config)
    this.kvs = new KvsService(this.database)
    this.channels = new ChannelService(this.config, this.router)
  }

  async setup() {
    this.config.setup()
    await this.database.setup()
    await this.kvs.setup()
    this.channels.setup()
  }
}
