import { uuid } from '../../base/types'

export interface Thread {
  id: uuid
  senderId: uuid
  name: string
}
