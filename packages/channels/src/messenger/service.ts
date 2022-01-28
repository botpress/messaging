import { ChannelService, ChannelState } from '../base/service'
import { MessengerConfig } from './config'

export interface MessengerState extends ChannelState<MessengerConfig> {}

export class MessengerService extends ChannelService<MessengerConfig, MessengerState> {
  async create(scope: string, config: MessengerConfig) {
    return {
      config
    }
  }
}
