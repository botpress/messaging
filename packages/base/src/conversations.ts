import { Message } from './messages'
import { uuid } from './uuid'

export interface Conversation {
  id: uuid
  clientId: uuid
  userId: uuid
  createdOn: Date
}

export interface ConversationWithLastMessage extends Conversation {
  lastMessage?: Message
}
