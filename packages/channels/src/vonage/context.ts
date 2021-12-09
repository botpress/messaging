import { ChannelMessage } from '@vonage/server-sdk'
import { ChannelContext, IndexChoiceOption } from '../base/context'
import { Logger } from '../base/logger'
import { VonageState } from './service'

export type VonageContext = ChannelContext<VonageState> & {
  messages: ChannelMessage[]
  prepareIndexResponse: (scope: string, identity: string, thread: string, options: IndexChoiceOption[]) => void
}
