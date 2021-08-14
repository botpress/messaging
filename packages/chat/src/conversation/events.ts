import { Conversation, Emitter } from '@botpress/messaging-base'

export enum ConversationEvents {
  Set = 'set'
}

export interface ConversationSetEvent {
  previous: Conversation | undefined
  value: Conversation | undefined
}

export class ConversationEmitter extends Emitter<{
  [ConversationEvents.Set]: ConversationSetEvent
}> {}

export type ConversationWatcher = Omit<ConversationEmitter, 'emit'>
