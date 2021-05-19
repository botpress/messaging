import { Twilio } from 'twilio'
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message'
import { ChannelContext } from '../base/context'

export type TwilioContext = ChannelContext<Twilio> & {
  messages: Partial<MessageInstance>[]
  botPhoneNumber: string
  targetPhoneNumber: string
  // prepareIndexResponse(event: sdk.IO.OutgoingEvent, options: MessageOption[]): Promise<void>
}
