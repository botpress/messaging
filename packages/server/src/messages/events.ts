import { Emitter, Message } from '@botpress/messaging-base'
import { ActionSource } from '../base/source'

export enum MessageEvents {
  Created
}

export interface MessageCreatedEvent {
  message: Message
  source?: ActionSource
}

export class MessageEmitter extends Emitter<{
  [MessageEvents.Created]: MessageCreatedEvent
}> {}

export type MessageWatcher = Omit<MessageEmitter, 'emit'>
