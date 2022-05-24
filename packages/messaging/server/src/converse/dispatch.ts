import { uuid, Dispatcher } from '@botpress/framework'
import { Message } from '@botpress/messaging-base'

export enum ConverseDispatches {
  Message,
  Stop
}

export interface ConverseMessageDispatch {
  message: Message
}

export interface ConverseStopDispatch {
  conversationId: uuid
}

export class ConverseDispatcher extends Dispatcher<{
  [ConverseDispatches.Message]: ConverseMessageDispatch
  [ConverseDispatches.Stop]: ConverseStopDispatch
}> {}
