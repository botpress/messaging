import { uuid } from '../base/types'

export interface Conversation {
  clientId: uuid
  id: uuid
  userId: string
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
