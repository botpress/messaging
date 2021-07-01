import { Emitter } from '../base/events'
import { uuid } from '../base/types'
import { Provider } from './types'

export enum ProviderEvents {
  Updated = -6307907498173656
}

export interface ProviderUpdatedEvent {
  providerId: uuid
  oldProvider: Provider
}

export class ProviderEmitter extends Emitter<{
  [ProviderEvents.Updated]: ProviderUpdatedEvent
}> {}

export type ProviderWatcher = Omit<ProviderEmitter, 'emit'>
