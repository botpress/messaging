import { uuid } from '@botpress/base'

export interface House {
  id: uuid
  clientId: uuid
  address: string
}
