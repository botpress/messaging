import { Channel } from '../base/channel'
import { TwilioApi } from './api'
import { TwilioConfig, TwilioConfigSchema } from './config'
import { TwilioService } from './service'
import { TwilioStream } from './stream'

export class TwilioChannel extends Channel<TwilioConfig, TwilioService, TwilioApi, TwilioStream> {
  get meta() {
    return {
      id: '330ca935-6441-4159-8969-d0a0d3f188a1',
      name: 'twilio',
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
