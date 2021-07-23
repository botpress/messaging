import { ChannelContext } from '../base/context'
import { MessengerClient } from './client'

export type MessengerContext = ChannelContext<MessengerClient> & {
  messages: any[]
}

export type MessengerAction = 'typing_on' | 'typing_off' | 'mark_seen'
