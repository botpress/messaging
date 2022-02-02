import { Activity, ConversationReference } from 'botbuilder'
import { ChannelContext } from '../base/context'
import { TeamsState } from './service'

export type TeamsContext = ChannelContext<TeamsState> & {
  messages: Partial<Activity>[]
  convoRef: Partial<ConversationReference>
}
