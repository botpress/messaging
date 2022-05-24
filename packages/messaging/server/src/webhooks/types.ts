import { uuid } from '@botpress/base'

export interface Webhook {
  id: uuid
  clientId: uuid
  url: string
  token: string
}
