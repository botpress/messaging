import { ChannelService, ChannelState } from '../base/service'
import { VonageConfig } from './config'

export interface VonageState extends ChannelState<VonageConfig> {}

export class VonageService extends ChannelService<VonageConfig, VonageState> {
  async create(scope: string, config: VonageConfig) {
    return {
      config
    }
  }
}
