import { Emitter, uuid } from '@botpress/messaging-base'

export enum InstanceEvents {
  Setup,
  SetupFailed,
  Initialized,
  InitializationFailed,
  Destroyed
}

export class InstanceEmitter extends Emitter<{
  [InstanceEvents.Setup]: uuid
  [InstanceEvents.SetupFailed]: uuid
  [InstanceEvents.Initialized]: uuid
  [InstanceEvents.InitializationFailed]: uuid
  [InstanceEvents.Destroyed]: uuid
}> {}

export type InstanceWatcher = Omit<InstanceEmitter, 'emit'>
