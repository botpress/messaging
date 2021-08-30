import { Context, Telegraf } from 'telegraf'
import * as tg from 'telegraf/src/core/types/typegram'
import { ChatAction, ExtraAnimation, ExtraPhoto, ExtraReplyMessage } from 'telegraf/typings/telegram-types'
import { ChannelContext } from '../base/context'

export interface TelegramContext extends ChannelContext<Telegraf<Context>> {
  messages: TelegramMessage[]
}

interface TelegramTextMessage {
  text: string
  markdown?: boolean
  extra?: ExtraReplyMessage
}
interface TelegramPhotoMessage {
  photo: tg.Opts<'sendPhoto'>['photo']
  extra?: ExtraPhoto
}
interface TelegramAnimationMessage {
  animation: tg.Opts<'sendAnimation'>['animation']
  extra?: ExtraAnimation
}
interface TelegramActionMessage {
  action: ChatAction
}

export type TelegramMessage =
  | TelegramTextMessage
  | TelegramPhotoMessage
  | TelegramAnimationMessage
  | TelegramActionMessage
