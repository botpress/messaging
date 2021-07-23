import { ChannelContext } from '../base/context'
import { MessengerClient } from './client'

export type MessengerContext = ChannelContext<MessengerClient> & {
  messages: any[]
}
