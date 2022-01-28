import { ChannelContext } from '../base/context'
import { MessengerState } from './service'
import { MessengerStream } from './stream'

export type MessengerContext = ChannelContext<MessengerState> & {
  messages: any[]
  stream: MessengerStream
}
