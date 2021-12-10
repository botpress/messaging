import { ChannelTemplate } from '../base/channel'
import { SlackApi } from './api'
import { SlackConfig, SlackConfigSchema } from './config'
import { SlackService } from './service'
import { SlackStream } from './stream'

export class SlackChannel extends ChannelTemplate<SlackConfig, SlackService, SlackApi, SlackStream> {
  get meta() {
    return {
      id: 'd6111009-712d-485e-a62d-1540f966f4f3',
      name: 'slack',
      schema: SlackConfigSchema,
      initiable: false,
      lazy: true
    }
  }

  constructor() {
    const service = new SlackService()
    super(service, new SlackApi(service), new SlackStream(service))
  }
}
