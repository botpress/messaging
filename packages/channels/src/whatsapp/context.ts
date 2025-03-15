import { ChannelContext, IndexChoiceOption } from '../base/context'
import { WhatsappState } from './service'
import { WhatsappStream } from './stream'
import { WhatsappOutgoingMessage } from './whatsapp'

export type WhatsappContext = ChannelContext<WhatsappState> & {
  messages: WhatsappOutgoingMessage[]
  stream: WhatsappStream
  prepareIndexResponse(scope: string, identity: string, sender: string, options: IndexChoiceOption[]): void
}
