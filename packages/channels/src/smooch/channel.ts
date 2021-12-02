import { Router } from 'express'
import { ChannelApiManager } from '../base/api'
import { Emitter } from '../base/emitter'
import { Endpoint } from '../base/endpoint'
import { SmoochApi } from './api'
import { SmoochConfig } from './config'
import { SmoochService } from './service'
import { SmoochStream } from './stream'

export class SmoochChannel extends Emitter<{ message: { scope: string; endpoint: Endpoint; content: any } }> {
  public readonly service: SmoochService
  public readonly api: SmoochApi
  public readonly stream: SmoochStream

  constructor() {
    super()
    this.service = new SmoochService()
    this.api = new SmoochApi(this.service)
    this.stream = new SmoochStream(this.service)
    this.service.on('receive', async (e) => {
      await this.emit('message', e)
    })
  }

  public async setup(router: Router) {
    await this.service.setup()
    await this.api.setup(new ChannelApiManager(router))
    await this.stream.setup()
  }

  async start(scope: string, config: SmoochConfig) {
    return this.service.start(scope, config)
  }

  async send(scope: string, endpoint: any, content: any) {
    return this.service.send(scope, endpoint, content)
  }

  async stop(scope: string) {
    return this.service.stop(scope)
  }
}
