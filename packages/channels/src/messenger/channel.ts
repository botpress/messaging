import { Channel } from '../base/channel'
import { MessengerApi } from './api'
import { MessengerConfig, MessengerConfigSchema } from './config'
import { MessengerService } from './service'
import { MessengerStream } from './stream'

export class MessengerChannel extends Channel<MessengerConfig, MessengerService, MessengerApi, MessengerStream> {
  get meta() {
    return {
      id: 'c4bb1487-b3bd-49b3-a3dd-36db908d165d',
      name: 'messenger',
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
