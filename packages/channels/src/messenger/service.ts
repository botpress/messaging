import { ChannelService, ChannelState } from '../base/service'
import { MessengerClient } from './client'
import { MessengerConfig } from './config'

export interface MessengerState extends ChannelState<MessengerConfig> {
  client: MessengerClient
}

export class MessengerService extends ChannelService<MessengerConfig, MessengerState> {
  async create(scope: string, config: MessengerConfig) {
    return {
      config,
      client: new MessengerClient(config)
    }
  }
}
