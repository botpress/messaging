import { ChannelTemplate } from '../base/channel'
import { MessengerApi } from './api'
import { MessengerConfig, MessengerConfigSchema } from './config'
import { MessengerService } from './service'
import { MessengerStream } from './stream'

export class MessengerChannel extends ChannelTemplate<
  MessengerConfig,
  MessengerService,
  MessengerApi,
  MessengerStream
> {
  get meta() {
    return {
      id: 'aa88f73d-a9fb-456f-b0d0-5c0031e4aa34',
      name: 'messenger',
      version: '1.0.0',
      schema: MessengerConfigSchema,
      initiable: true,
      lazy: true
    }
  }

  constructor() {
    const service = new MessengerService()
    super(service, new MessengerApi(service), new MessengerStream(service))
  }
}
