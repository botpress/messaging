import { uuid } from '@botpress/base'

export interface Message {
  id: uuid
  conversationId: uuid
  authorId: uuid | undefined
  sentOn: Date
  payload: any
}
