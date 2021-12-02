import { Router } from 'express'
import { ChannelApiManager } from '../base/api'
import { Emitter } from '../base/emitter'
import { Endpoint } from '../base/endpoint'
import { TwilioApi } from './api'
import { TwilioConfig } from './config'
import { TwilioService } from './service'
import { TwilioStream } from './stream'

export class TwilioChannel extends Emitter<{ message: { scope: string; endpoint: Endpoint; content: any } }> {
  public readonly service: TwilioService
  public readonly api: TwilioApi
  public readonly stream: TwilioStream

  constructor() {
    super()
    this.service = new TwilioService()
    this.api = new TwilioApi(this.service)
    this.stream = new TwilioStream(this.service)
    this.service.on('receive', async (e) => {
      await this.emit('message', e)
    })
  }

  public async setup(router: Router) {
    await this.service.setup()
    await this.api.setup(new ChannelApiManager(router))
    await this.stream.setup()
  }

  async start(scope: string, config: TwilioConfig) {
    return this.service.start(scope, config)
  }

  async send(scope: string, endpoint: any, content: any) {
    return this.service.send(scope, endpoint, content)
  }

  async stop(scope: string) {
    return this.service.stop(scope)
  }
}
