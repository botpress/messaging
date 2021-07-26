import Vonage, { ChannelMessage } from '@vonage/server-sdk'
import { ChannelContext, IndexChoiceOption } from '../base/context'

export type VonageContext = ChannelContext<Vonage> & {
  messages: ChannelMessage[]
  isSandbox: boolean
  prepareIndexResponse: (identity: string, thread: string, options: IndexChoiceOption[]) => void
}
