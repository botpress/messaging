import { Emitter } from '../base/events'
import { uuid } from '../base/types'

// Note: event type ids should be random numbers between -9007199254740991 and 9007199254740991
export enum ConduitEvents {
  Deleting = -2992045965298849,
  Updating = -4333216986594445
}

export interface ConduitDeletingEvent {
  providerId: uuid
  channelId: uuid
}

export interface ConduitUpdatingEvent {
  providerId: uuid
  channelId: uuid
}

export class ConduitEmitter extends Emitter<{
  [ConduitEvents.Deleting]: ConduitDeletingEvent
  [ConduitEvents.Updating]: ConduitUpdatingEvent
}> {}

export type ConduitWatcher = Omit<ConduitEmitter, 'emit'>
