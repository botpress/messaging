import { Router } from 'express'
import { ChannelApi, ChannelApiManager } from './api'
import { ChannelConfig } from './config'
import { Emitter } from './emitter'
import { Endpoint } from './endpoint'
import { ChannelService } from './service'
import { ChannelStream } from './stream'

export abstract class Channel<
  TConfig extends ChannelConfig,
  TService extends ChannelService<TConfig, any>,
  TApi extends ChannelApi<TService>,
  TStream extends ChannelStream<TService>
> extends Emitter<{
  message: MessageEvent
}> {
  constructor(public readonly service: TService, public readonly api: TApi, public readonly stream: TStream) {
    super()
    this.service.on('receive', async (e) => {
      await this.emit('message', e)
    })
  }

  public async setup(router: Router) {
    await this.service.setup()
    await this.api.setup(new ChannelApiManager(router))
    await this.stream.setup()
  }

  async start(scope: string, config: TConfig) {
    return this.service.start(scope, config)
  }

  async send(scope: string, endpoint: any, content: any) {
    return this.service.send(scope, endpoint, content)
  }

  async stop(scope: string) {
    return this.service.stop(scope)
  }
}

export interface MessageEvent {
  scope: string
  endpoint: Endpoint
  content: any
}
