import express, { Response } from 'express'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { ChannelInitializeEvent, ChannelStartEvent } from '../base/service'
import { SmoochService } from './service'

export class SmoochApi extends ChannelApi<SmoochService> {
  async setup(router: ChannelApiManager) {
    router.use('/smooch', express.json())
    router.post('/smooch', this.handleRequest.bind(this))

    this.service.on('start', this.handleStart.bind(this))
    this.service.on('initialize', this.handleInitialize.bind(this))
  }

  protected async handleStart({ scope }: ChannelStartEvent) {}

  protected async handleInitialize({ scope }: ChannelInitializeEvent) {}

  private async handleRequest(req: ChannelApiRequest, res: Response) {}
}
