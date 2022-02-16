import { Conversation, Emitter, uuid } from '@botpress/messaging-base'

export enum ConversationEvents {
  Created,
  Started
}

export interface ConversationCreatedEvent {
  conversation: Conversation
}

export interface ConversationStartedEvent {
  conversationId: uuid
}

export class ConversationEmitter extends Emitter<{
  [ConversationEvents.Created]: ConversationCreatedEvent
  [ConversationEvents.Started]: ConversationStartedEvent
}> {}

export type ConversationWatcher = Omit<ConversationEmitter, 'emit'>
