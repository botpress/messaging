import { ChannelContext, IndexChoiceOption } from '../base/context'
import { VonageState } from './service'

export type VonageContext = ChannelContext<VonageState> & {
  messages: any[]
  prepareIndexResponse(scope: string, identity: string, sender: string, options: IndexChoiceOption[]): void
}
