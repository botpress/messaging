import { Emitter } from '../base/events'
import { uuid } from '../base/types'

// Note: event type ids should be random numbers between -9007199254740991 and 9007199254740991
export enum InstanceEvents {
  Setup = -152025756428307,
  SetupFailed = 1227260138789451,
  Initialized = 8719796083603497,
  InitializationFailed = -7790961391717513,
  Destroyed = 1601810829650873
}

export class InstanceEmitter extends Emitter<{
  [InstanceEvents.Setup]: uuid
  [InstanceEvents.SetupFailed]: uuid
  [InstanceEvents.Initialized]: uuid
  [InstanceEvents.InitializationFailed]: uuid
  [InstanceEvents.Destroyed]: uuid
}> {}

export type InstanceWatcher = Omit<InstanceEmitter, 'emit'>
