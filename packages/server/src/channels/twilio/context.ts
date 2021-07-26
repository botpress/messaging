import { Twilio } from 'twilio'
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message'
import { ChannelContext, IndexChoiceOption } from '../base/context'

export type TwilioContext = ChannelContext<Twilio> & {
  messages: Partial<MessageInstance>[]
  prepareIndexResponse(identity: string, sender: string, options: IndexChoiceOption[]): void
}

export interface TwilioRequestBody {
  To: string
  From: string
  Body: string
}
