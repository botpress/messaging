import { ChannelApi, ChannelApiManager } from '../base/api'
import { MessengerService } from './service'

export class MessengerApi extends ChannelApi<MessengerService> {
  async setup(router: ChannelApiManager) {
    // TODO
  }
}
