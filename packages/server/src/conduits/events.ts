import { uuid } from '@botpress/messaging-base'
import { Emitter } from '../base/events'

// Note: event type ids should be random numbers between -9007199254740991 and 9007199254740991
export enum ConduitEvents {
  Created = -8735528850944253,
  Deleting = -2992045965298849,
  Updated = -4333216986594445
}

export class ConduitEmitter extends Emitter<{
  [ConduitEvents.Created]: uuid
  [ConduitEvents.Deleting]: uuid
  [ConduitEvents.Updated]: uuid
}> {}

export type ConduitWatcher = Omit<ConduitEmitter, 'emit'>
