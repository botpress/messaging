import { ChannelService, ChannelState } from '../base/service'
import { SmoochConfig } from './config'

export interface SmoochState extends ChannelState<SmoochConfig> {}

export class SmoochService extends ChannelService<SmoochConfig, SmoochState> {
  async create(scope: string, config: SmoochConfig) {
    return {
      config
    }
  }
}
