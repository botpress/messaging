import { uuid } from '@botpress/messaging-base'
import { Emitter } from '../base/events'
import { Provider } from './types'

export enum ProviderEvents {
  Updated = -6307907498173656,
  Deleting = 4113861503631719
}

export interface ProviderUpdatedEvent {
  providerId: uuid
  oldProvider: Provider
}

export interface ProviderDeletingEvent {
  providerId: uuid
}

export class ProviderEmitter extends Emitter<{
  [ProviderEvents.Updated]: ProviderUpdatedEvent
  [ProviderEvents.Deleting]: ProviderDeletingEvent
}> {}

export type ProviderWatcher = Omit<ProviderEmitter, 'emit'>
