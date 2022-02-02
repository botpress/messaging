import { Response } from 'express'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { ChannelStartEvent } from '../base/service'
import { TeamsService } from './service'

export class TeamsApi extends ChannelApi<TeamsService> {
  async setup(router: ChannelApiManager) {
    router.post('/teams', this.handleRequest.bind(this))

    this.service.on('start', this.handleStart.bind(this))
  }

  protected async handleStart({ scope }: ChannelStartEvent) {}

  private async handleRequest(req: ChannelApiRequest, res: Response) {}
}
