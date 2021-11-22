import { Dispatcher } from '@botpress/messaging-engine'

export enum StreamDispatches {
  Message
}

export class StreamDispatcher extends Dispatcher<{
  [StreamDispatches.Message]: any
}> {}
