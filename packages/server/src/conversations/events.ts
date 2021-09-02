import { Conversation, Emitter } from '@botpress/messaging-base'

export enum ConversationEvents {
  Created
}

export interface ConversationCreatedEvent {
  conversation: Conversation
}

export class ConversationEmitter extends Emitter<{
  [ConversationEvents.Created]: ConversationCreatedEvent
}> {}

export type ConversationWatcher = Omit<ConversationEmitter, 'emit'>
