import { Dispatcher } from '@botpress/engine'

export enum InstanceLifetimeDispatches {
  Stop
}

export interface InstanceLifetimeStopDispatch {}

export class InstanceLifetimeDispatcher extends Dispatcher<{
  [InstanceLifetimeDispatches.Stop]: InstanceLifetimeStopDispatch
}> {}
