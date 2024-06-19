import { ChannelService, ChannelState } from '../base/service'
import { WhatsappConfig } from './config'

export interface WhatsappState extends ChannelState<WhatsappConfig> {}

export class WhatsappService extends ChannelService<WhatsappConfig, WhatsappState> {
  async create(scope: string, config: WhatsappConfig) {
    return {
      config
    }
  }
}
