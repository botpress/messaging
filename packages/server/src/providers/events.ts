import { Emitter, uuid } from '@botpress/messaging-base'
import { Provider } from './types'

export enum ProviderEvents {
  Updated,
  Deleting
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
