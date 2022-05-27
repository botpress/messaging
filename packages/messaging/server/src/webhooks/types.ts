import { uuid } from '@botpress/framework'

export interface Webhook {
  id: uuid
  clientId: uuid
  url: string
  token: string
}
