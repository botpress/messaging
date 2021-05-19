import { uuid } from '../base/types'

export interface Conversation {
  id: uuid
  userId: string
  botId: string
  createdOn: Date
}

export interface RecentConversation extends Conversation {
  // lastMessage?: Message
}

export interface ConversationDeleteFilters {
  id?: uuid
  userId?: string
}

export interface ConversationListFilters {
  userId: string
  limit?: number
  offset?: number
}
