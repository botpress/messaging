import { uuid } from '../../base/types'

export interface Sandboxmap {
  conduitId: uuid
  identity: string
  sender: string
  thread: string
  clientId: uuid
}
