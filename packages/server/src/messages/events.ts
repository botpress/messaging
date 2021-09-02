import { Emitter, Message } from '@botpress/messaging-base'

export enum MessageEvents {
  Created
}

export interface MessageCreatedEvent {
  message: Message
}

export class MessageEmitter extends Emitter<{
  [MessageEvents.Created]: MessageCreatedEvent
}> {}

export type MessageWatcher = Omit<MessageEmitter, 'emit'>
