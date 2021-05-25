import Vonage, { ChannelMessage } from '@vonage/server-sdk'
import { ChannelContext } from '../base/context'

export type VonageContext = ChannelContext<Vonage> & {
  messages: ChannelMessage[]
  isSandbox: boolean
}
