import { uuid } from '../base/types'

export interface Webhook {
  id: uuid
  clientId: uuid
  url: string
  token: string
}

export type WebhookContent =
  | {
      type: 'message'
      channel: { name: string }
      user: { id: string }
      conversation: { id: string }
      message: any
    }
  | {
      type: 'health'
      channel: { name: string }
      event: any
    }
