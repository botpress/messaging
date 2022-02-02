import { ChannelService, ChannelState } from '../base/service'
import { TeamsConfig } from './config'

export interface TeamsState extends ChannelState<TeamsConfig> {}

export class TeamsService extends ChannelService<TeamsConfig, TeamsState> {
  async create(scope: string, config: TeamsConfig) {
    return {
      config
    }
  }
}
