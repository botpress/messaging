import { uuid } from '@botpress/messaging-base'

export interface Webhook {
  id: uuid
  clientId: uuid
  url: string
  token: string
}

export type WebhookContent =
  | {
      type: 'message'
      client: { id: string }
      channel: { name: string }
      user: { id: string }
      conversation: { id: string }
      message: any
    }
  | {
      type: 'health'
      client: { id: string }
      channel: { name: string }
      event: any
    }
