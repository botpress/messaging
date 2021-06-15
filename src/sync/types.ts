import { Conduit } from '../conduits/types'
import { Webhook } from '../webhooks/types'

export interface SyncRequest {
  clientId: string
  webhooks: Webhook[]
  conduits: { [channel: string]: Conduit }
  providerName: string
}

export interface SyncResult {
  clientId: string
  clientToken?: string
  providerName: string
}
