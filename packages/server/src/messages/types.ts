import { uuid } from '../base/types'

export interface Message {
  id: uuid
  conversationId: uuid
  authorId: string | undefined
  sentOn: Date
  payload: any
}
