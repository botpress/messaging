import { uuid } from '@botpress/messaging-base'

export interface House {
  id: uuid
  clientId: uuid
  address: string
}
