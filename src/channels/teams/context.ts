import { Activity, BotFrameworkAdapter, ConversationReference } from 'botbuilder'
import { ChannelContext } from '../base/context'

export type TeamsContext = ChannelContext<BotFrameworkAdapter> & {
  messages: Partial<Activity>[]
  convoRef: Partial<ConversationReference>
}
