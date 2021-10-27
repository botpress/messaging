import { uuid, Message } from '@botpress/messaging-base'

export interface Collector {
  messageId: uuid
  conversationId: uuid
  messages: Message[]
  resolve?: (x: Message[]) => void
  timeout?: NodeJS.Timeout
}
