import { ChannelContext, IndexChoiceOption} from '../base/context'
import { WhatsappState } from './service'
import { WhatsappStream } from './stream'

export type WhatsappContext = ChannelContext<WhatsappState> & {
  messages: any[]
  stream: WhatsappStream
  prepareIndexResponse(scope: string, identity: string, sender: string, options: IndexChoiceOption[]): void
}
