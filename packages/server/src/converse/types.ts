import { uuid } from '@botpress/messaging-base'
import { Message } from '@botpress/messaging-base'

export interface Collector {
  conversationId: uuid
  messages: Message[]
  resolve?: (x: Message[]) => void
  timeout?: NodeJS.Timeout
}
