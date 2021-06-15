import { uuid } from '../base/types'

export interface Webhook {
  id: uuid
  clientId: uuid
  url: string
}
