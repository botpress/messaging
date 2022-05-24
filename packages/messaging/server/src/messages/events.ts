import { Emitter, uuid } from '@botpress/framework'
import { Message } from '@botpress/messaging-base'
import { ActionSource } from '../base/source'

export enum MessageEvents {
  Created,
  Feedback
}

export interface MessageCreatedEvent {
  message: Message
  source?: ActionSource
}

export interface MessageFeedbackEvent {
  messageId: uuid
  feedback: number
}

export class MessageEmitter extends Emitter<{
  [MessageEvents.Created]: MessageCreatedEvent
  [MessageEvents.Feedback]: MessageFeedbackEvent
}> {}

export type MessageWatcher = Omit<MessageEmitter, 'emit'>
