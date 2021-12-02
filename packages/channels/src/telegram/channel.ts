import { Router } from 'express'
import { ChannelApiManager } from '../base/api'
import { Emitter } from '../base/emitter'
import { Endpoint } from '../base/endpoint'
import { TelegramApi } from './api'
import { TelegramConfig } from './config'
import { TelegramService } from './service'
import { TelegramStream } from './stream'

export class TelegramChannel extends Emitter<{ message: { scope: string; endpoint: Endpoint; content: any } }> {
  public readonly service: TelegramService
  public readonly api: TelegramApi
  public readonly stream: TelegramStream

  constructor() {
    super()
    this.service = new TelegramService()
    this.api = new TelegramApi(this.service)
    this.stream = new TelegramStream(this.service)
    this.service.on('receive', async (e) => {
      await this.emit('message', e)
    })
  }

  public async setup(router: Router) {
    await this.service.setup()
    await this.api.setup(new ChannelApiManager(router))
    await this.stream.setup()
  }

  async start(scope: string, config: TelegramConfig) {
    return this.service.start(scope, config)
  }

  async send(scope: string, endpoint: any, content: any) {
    return this.service.send(scope, endpoint, content)
  }

  async stop(scope: string) {
    return this.service.stop(scope)
  }
}
