import { uuid } from '@botpress/messaging-base'
import { Dispatcher } from '@botpress/messaging-engine'

export enum StreamDispatches {
  Message
}

export interface StreamMessageDispatch {
  userId: uuid
  source?: string
  data: {
    type: string
    data: any
  }
}

export class StreamDispatcher extends Dispatcher<{
  [StreamDispatches.Message]: StreamMessageDispatch
}> {}
