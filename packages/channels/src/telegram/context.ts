import { ChatAction, InputFile } from 'telegraf/typings/core/types/typegram'
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
  document?: InputFile
  audio?: InputFile
  video?: InputFile
  location?: {
    latitude: number
    longitude: number
  }
  extra?: any
}
