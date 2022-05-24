import { Dispatcher } from '@botpress/framework'

export enum InstanceLifetimeDispatches {
  Stop
}

export interface InstanceLifetimeStopDispatch {}

export class InstanceLifetimeDispatcher extends Dispatcher<{
  [InstanceLifetimeDispatches.Stop]: InstanceLifetimeStopDispatch
}> {}
