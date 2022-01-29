import { ChannelTemplate } from '../base/channel'
import { TwilioApi } from './api'
import { TwilioConfig, TwilioConfigSchema } from './config'
import { TwilioService } from './service'
import { TwilioStream } from './stream'

export class TwilioChannel extends ChannelTemplate<TwilioConfig, TwilioService, TwilioApi, TwilioStream> {
  get meta() {
    return {
      id: 'a711e325-7e71-4955-a76c-b46e62cdebd7',
      name: 'twilio',
      version: '1.0.0',
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
