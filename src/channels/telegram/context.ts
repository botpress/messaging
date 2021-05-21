import Telegraf from 'telegraf'
import { TelegrafContext } from 'telegraf/typings/context'
import { ChatAction, ExtraReplyMessage, InputFile } from 'telegraf/typings/telegram-types'
import { ChannelContext } from '../base/context'

export type TelegramContext = ChannelContext<Telegraf<TelegrafContext>> & {
  messages: TelegramMessage[]
}

export interface TelegramMessage {
  text?: string
  animation?: string
  photo?: InputFile
  markdown?: boolean
  action?: ChatAction
  extra?: ExtraReplyMessage
}
