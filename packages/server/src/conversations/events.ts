import { Conversation, Emitter, uuid } from '@botpress/messaging-base'

export enum ConversationEvents {
  Created,
  Started,
  Visit
}

export interface ConversationCreatedEvent {
  conversation: Conversation
}

export interface ConversationStartedEvent {
  conversationId: uuid
}

export interface ConversationVisitEvent {
  conversationId: uuid
  timezone: number
  locale: string
}

export class ConversationEmitter extends Emitter<{
  [ConversationEvents.Created]: ConversationCreatedEvent
  [ConversationEvents.Started]: ConversationStartedEvent
  [ConversationEvents.Visit]: ConversationVisitEvent
}> {}

export type ConversationWatcher = Omit<ConversationEmitter, 'emit'>
