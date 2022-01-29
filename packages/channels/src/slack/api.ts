import { Response } from 'express'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { SlackService } from './service'

export class SlackApi extends ChannelApi<SlackService> {
  async setup(router: ChannelApiManager) {
    router.post('/slack/interactive', this.handleInteractiveRequest.bind(this))
    router.post('/slack/events', this.handleEventRequest.bind(this))

    this.service.on('start', this.handleStart.bind(this))
  }

  private async handleInteractiveRequest(req: ChannelApiRequest, res: Response) {}

  private async handleEventRequest(req: ChannelApiRequest, res: Response) {}

  private async handleStart({ scope }: { scope: string }) {}
}
