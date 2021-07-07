import Vonage, { ChannelMessage } from '@vonage/server-sdk'
import { ChoiceOption } from '../../content/types'
import { ChannelContext } from '../base/context'

export type VonageContext = ChannelContext<Vonage> & {
  messages: ChannelMessage[]
  isSandbox: boolean
  prepareIndexResponse: (identity: string, thread: string, options: ChoiceOption[]) => Promise<void>
}
