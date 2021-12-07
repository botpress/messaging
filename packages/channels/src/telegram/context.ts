import { ChatAction, ExtraReplyMessage, InputFile } from 'telegraf/typings/telegram-types'
import { ChannelContext } from '../base/context'
import { TelegramState } from './service'

export type TelegramContext = ChannelContext<TelegramState> & {
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
