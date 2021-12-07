import { Telegraf } from 'telegraf'
import { TelegrafContext } from 'telegraf/typings/context'
import { ChannelService, ChannelState } from '../base/service'
import { TelegramConfig } from './config'

export interface TelegramState extends ChannelState<TelegramConfig> {
  telegraf: Telegraf<TelegrafContext>
  callback?: (req: any, res: any) => void
}

export class TelegramService extends ChannelService<TelegramConfig, TelegramState> {
  async create(scope: string, config: TelegramConfig) {
    const telegraf = new Telegraf(config.botToken)

    return {
      config,
      telegraf
    }
  }
}
