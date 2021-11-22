import { Message, uuid } from '@botpress/messaging-base'
import { Dispatcher } from '@botpress/messaging-engine'

export enum ConverseDispatches {
  Message,
  Stop
}

export interface ConverseMessageDispatch {
  incomingId: uuid
  message: Message
}

export interface ConverseStopDispatch {
  conversationId: uuid
  messageId: uuid
}

export class ConverseDispatcher extends Dispatcher<{
  [ConverseDispatches.Message]: ConverseMessageDispatch
  [ConverseDispatches.Stop]: ConverseStopDispatch
}> {}
