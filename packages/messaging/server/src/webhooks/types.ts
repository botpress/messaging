import { uuid } from '@botpress/messaging-base'

export interface Webhook {
  id: uuid
  clientId: uuid
  url: string
  token: string
}
