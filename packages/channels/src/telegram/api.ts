import { Response } from 'express'
import yn from 'yn'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { ChannelInitializeEvent, ChannelStartEvent } from '../base/service'
import { TelegramService } from './service'

export class TelegramApi extends ChannelApi<TelegramService> {
  async setup(router: ChannelApiManager) {
    router.post('/telegram', this.handleRequest.bind(this))

    this.service.on('start', this.handleStart.bind(this))
    this.service.on('initialize', this.handleInitialize.bind(this))
  }

  private async handleRequest(req: ChannelApiRequest, res: Response) {}

  protected async handleInitialize({ scope }: ChannelInitializeEvent) {
    if (this.useWebhook()) {
    }
  }

  private async handleStart({ scope }: ChannelStartEvent) {}

  private useWebhook() {
    // TODO: remove this dependency on server env vars
    return !yn(process.env.SPINNED) || yn(process.env.CLUSTER_ENABLED)
  }

  private async receive(scope: string, ctx: any) {}
}
