import { Dispatcher } from '@botpress/messaging-engine'

export enum InstanceLifetimeDispatches {
  Stop
}

export interface InstanceLifetimeStopDispatch {}

export class InstanceLifetimeDispatcher extends Dispatcher<{
  [InstanceLifetimeDispatches.Stop]: InstanceLifetimeStopDispatch
}> {}
