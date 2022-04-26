import { uuid } from '@botpress/messaging-base'

export interface Thread {
  id: uuid
  senderId: uuid
  name: string
}
