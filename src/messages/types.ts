import { uuid } from '../base/types'

export interface Message {
  id: uuid
  conversationId: uuid
  authorId: string | undefined
  sentOn: Date
  payload: any
}

export interface MessageDeleteFilters {
  id?: uuid
  conversationId?: uuid
}

export interface MessageListFilters {
  conversationId: uuid
  limit?: number
  offset?: number
}
