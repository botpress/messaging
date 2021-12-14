import { Emitter, uuid } from '@botpress/messaging-base'
import { Client } from './types'

export enum ClientEvents {
  Updated
}

export interface ClientUpdatedEvent {
  clientId: uuid
  oldClient: Client
}

export class ClientEmitter extends Emitter<{
  [ClientEvents.Updated]: ClientUpdatedEvent
}> {}

export type ClientWatcher = Omit<ClientEmitter, 'emit'>
