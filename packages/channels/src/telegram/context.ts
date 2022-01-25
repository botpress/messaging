import { ChannelContext } from '../base/context'
import { TelegramState } from './service'

export type TelegramContext = ChannelContext<TelegramState> & {}
