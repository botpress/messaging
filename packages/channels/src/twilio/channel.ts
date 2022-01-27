import { ChannelTemplate } from '../base/channel'
import { TwilioApi } from './api'
import { TwilioConfig, TwilioConfigSchema } from './config'
import { TwilioService } from './service'
import { TwilioStream } from './stream'

export class TwilioChannel extends ChannelTemplate<TwilioConfig, TwilioService, TwilioApi, TwilioStream> {
  get meta() {
    return {
      id: '330ca935-6441-4159-8969-d0a0d3f188a1',
      name: 'twilio',
      version: '0.1.0',
      schema: TwilioConfigSchema,
      initiable: false,
      lazy: true
    }
  }

  constructor() {
    const service = new TwilioService()
    super(service, new TwilioApi(service), new TwilioStream(service))
  }
}
