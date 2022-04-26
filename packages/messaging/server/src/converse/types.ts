import { uuid, Message } from '@botpress/messaging-base'

export interface Collector {
  // Id of the message that started the collector
  incomingId: uuid
  conversationId: uuid
  messages: Message[]
  resolve?: (x: Message[]) => void
  timeout?: NodeJS.Timeout
}
