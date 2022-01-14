import { uuid } from './uuid'

export interface Conversation {
  id: uuid
  clientId: uuid
  userId: uuid
  createdOn: Date
}
