import { uuid } from '@botpress/base'

export interface ClientToken {
  id: uuid
  clientId: uuid
  token: string
  expiry: Date | undefined
}
