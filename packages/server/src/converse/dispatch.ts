import { Dispatcher } from '@botpress/messaging-engine'

export enum ConverseDispatches {
  Message,
  Stop
}

export class ConverseDispatcher extends Dispatcher<{
  [ConverseDispatches.Message]: any
  [ConverseDispatches.Stop]: any
}> {}
