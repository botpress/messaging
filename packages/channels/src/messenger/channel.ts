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
      id: 'c4bb1487-b3bd-49b3-a3dd-36db908d165d',
      name: 'messenger',
      version: '0.1.0',
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
