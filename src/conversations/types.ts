import { uuid } from '../base/types'
import { Message } from '../messages/types'

export interface Conversation {
  id: uuid
  clientId: uuid
  userId: string
  createdOn: Date
}

export interface RecentConversation extends Conversation {
  lastMessage?: Message
}
