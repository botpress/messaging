import { Channel } from '../base/channel'
import { TwilioApi } from './api'
import { TwilioConfig } from './config'
import { TwilioService } from './service'
import { TwilioStream } from './stream'

export class TwilioChannel extends Channel<TwilioConfig, TwilioService, TwilioApi, TwilioStream> {
  constructor() {
    const service = new TwilioService()
    super(service, new TwilioApi(service), new TwilioStream(service))
  }
}
