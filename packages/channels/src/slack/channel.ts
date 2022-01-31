import { ChannelTemplate } from '../base/channel'
import { SlackApi } from './api'
import { SlackConfig, SlackConfigSchema } from './config'
import { SlackService } from './service'
import { SlackStream } from './stream'

export class SlackChannel extends ChannelTemplate<SlackConfig, SlackService, SlackApi, SlackStream> {
  get meta() {
    return {
      id: 'a3551758-a03f-4a68-97f2-4536a8805b52',
      name: 'slack',
      version: '1.0.0',
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
