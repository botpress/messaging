import { ChannelMessage } from '@vonage/server-sdk'
import { ChannelContext, IndexChoiceOption } from '../base/context'
import { VonageState } from './service'

export type VonageContext = ChannelContext<VonageState> & {
  messages: ChannelMessage[]
  prepareIndexResponse: (identity: string, thread: string, options: IndexChoiceOption[]) => void
}
