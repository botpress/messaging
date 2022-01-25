import { ChannelService, ChannelState } from '../base/service'
import { TelegramConfig } from './config'

export interface TelegramState extends ChannelState<TelegramConfig> {
  callback?: (req: any, res: any) => void
}

export class TelegramService extends ChannelService<TelegramConfig, TelegramState> {
  async create(scope: string, config: TelegramConfig) {
    return {
      config
    }
  }

  async destroy(scope: string, state: TelegramState) {}
}
