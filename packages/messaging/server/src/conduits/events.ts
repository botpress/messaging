import { Emitter, uuid } from '@botpress/framework'

export enum ConduitEvents {
  Created,
  Deleting,
  Updated
}

export class ConduitEmitter extends Emitter<{
  [ConduitEvents.Created]: uuid
  [ConduitEvents.Deleting]: uuid
  [ConduitEvents.Updated]: uuid
}> {}

export type ConduitWatcher = Omit<ConduitEmitter, 'emit'>
