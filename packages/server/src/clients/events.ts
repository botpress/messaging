import { Emitter } from '../base/events'
import { uuid } from '../base/types'
import { Client } from './types'

export enum ClientEvents {
  Updated = 4198497150859385
}

export interface ClientUpdatedEvent {
  clientId: uuid
  oldClient: Client
}

export class ClientEmitter extends Emitter<{
  [ClientEvents.Updated]: ClientUpdatedEvent
}> {}

export type ClientWatcher = Omit<ClientEmitter, 'emit'>
