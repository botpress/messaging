import { ChannelService, ChannelState } from '../base/service'
import { SlackConfig } from './config'

export interface SlackState extends ChannelState<SlackConfig> {}

export class SlackService extends ChannelService<SlackConfig, SlackState> {
  async create(scope: string, config: SlackConfig) {
    return {
      config
    }
  }
}
