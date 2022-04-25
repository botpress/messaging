import { uuid } from './uuid'

export interface Message {
  id: uuid
  conversationId: uuid
  authorId: uuid | undefined
  sentOn: Date
  payload: any
}
