import { uuid } from '@botpress/messaging-base'

export interface Mapping {
  tunnelId: uuid
  identityId: uuid
  senderId: uuid
  threadId: uuid
  userId: uuid
  conversationId: uuid
}
