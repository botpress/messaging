import { Emitter, uuid } from '@botpress/messaging-base'

export enum InstanceLifetimeEvents {
  Setup,
  SetupFailed,
  Initialized,
  InitializationFailed,
  Destroyed
}

export class InstanceLifetimeEmitter extends Emitter<{
  [InstanceLifetimeEvents.Setup]: uuid
  [InstanceLifetimeEvents.SetupFailed]: uuid
  [InstanceLifetimeEvents.Initialized]: uuid
  [InstanceLifetimeEvents.InitializationFailed]: uuid
  [InstanceLifetimeEvents.Destroyed]: uuid
}> {}

export type InstanceLifetimeWatcher = Omit<InstanceLifetimeEmitter, 'emit'>
