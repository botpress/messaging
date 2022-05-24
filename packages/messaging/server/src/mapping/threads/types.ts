import { uuid } from '@botpress/framework'

export interface Thread {
  id: uuid
  senderId: uuid
  name: string
}
