import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message'
import { ChannelContext, IndexChoiceOption } from '../base/context'
import { TwilioState } from './service'

export type TwilioContext = ChannelContext<TwilioState> & {
  messages: Partial<MessageInstance>[]
  prepareIndexResponse(identity: string, sender: string, options: IndexChoiceOption[]): void
}
