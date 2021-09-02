import { Conversation, Emitter, uuid } from '@botpress/messaging-base'

export enum ConversationEvents {
  Choose = 'choose',
  Set = 'set'
}

export interface ConversationSetEvent {
  previous: Conversation | undefined
  value: Conversation | undefined
}

export interface ConversationChooseEvent {
  choice: uuid | undefined
}

export class ConversationEmitter extends Emitter<{
  [ConversationEvents.Set]: ConversationSetEvent
  [ConversationEvents.Choose]: ConversationChooseEvent
}> {}

export type ConversationWatcher = Omit<ConversationEmitter, 'emit'>
