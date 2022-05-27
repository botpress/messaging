import { uuid } from '@botpress/base'

export interface Conversation {
  id: uuid
  clientId: uuid
  userId: uuid
  createdOn: Date
}
