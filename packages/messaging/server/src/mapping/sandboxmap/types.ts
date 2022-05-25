import { uuid } from '@botpress/framework'

export interface Sandboxmap {
  conduitId: uuid
  identity: string
  sender: string
  thread: string
  clientId: uuid
}
