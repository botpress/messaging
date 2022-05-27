import { uuid } from '@botpress/framework'

export interface House {
  id: uuid
  clientId: uuid
  address: string
}
