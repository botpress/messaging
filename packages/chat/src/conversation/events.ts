import { Conversation } from '@botpress/messaging-client'
import { Emitter } from '../base/emitter'

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
