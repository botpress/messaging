import { Dispatcher } from '@botpress/messaging-engine'

export enum InstanceDispatches {
  Stop
}

export interface InstanceStopDispatch {}

export class InstanceDispatcher extends Dispatcher<{
  [InstanceDispatches.Stop]: InstanceStopDispatch
}> {}
