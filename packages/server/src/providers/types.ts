import { uuid } from '@botpress/messaging-base'

export interface Provider {
  id: uuid
  name: string
  sandbox: boolean
}
