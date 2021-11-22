import { Dispatcher } from '@botpress/messaging-engine'

export enum StreamDispatches {
  Message
}

export interface StreamMessageDispatch {
  source?: string
  payload: {
    type: string
    data: any
  }
}

export class StreamDispatcher extends Dispatcher<{
  [StreamDispatches.Message]: StreamMessageDispatch
}> {}
