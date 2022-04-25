import { uuid } from '@botpress/messaging-base'

export interface Sandboxmap {
  conduitId: uuid
  identity: string
  sender: string
  thread: string
  clientId: uuid
}
