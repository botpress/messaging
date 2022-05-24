import { uuid } from '@botpress/base'

export interface Thread {
  id: uuid
  senderId: uuid
  name: string
}
