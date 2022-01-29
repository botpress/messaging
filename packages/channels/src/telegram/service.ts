import { Request, Response } from 'express'
import { Telegraf } from 'telegraf'
import { ChannelService, ChannelState } from '../base/service'
import { TelegramConfig } from './config'

export interface TelegramState extends ChannelState<TelegramConfig> {
  telegraf: Telegraf
  callback?: (req: Request, res: Response) => any
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
