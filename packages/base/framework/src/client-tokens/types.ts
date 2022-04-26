import { uuid } from '@botpress/messaging-base'

export interface ClientToken {
  id: uuid
  clientId: uuid
  token: string
  expiry: Date | undefined
}
