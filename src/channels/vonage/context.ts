import Vonage, { ChannelMessage } from '@vonage/server-sdk'
import { ChannelContext } from '../base/context'

export type VonageContext = ChannelContext<Vonage> & {
  messages: ChannelMessage[]
  botPhoneNumber: string
  // prepareIndexResponse(event: sdk.IO.OutgoingEvent, options: sdk.ChoiceOption[]): Promise<void>
  isSandbox: boolean
  // debug: IDebugInstance
  // logger: sdk.Logger
}
