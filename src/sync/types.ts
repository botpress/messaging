import { uuid } from '../base/types'

export interface SyncRequest {
  channels?: SyncChannels
  webhooks?: SyncWebhook[]
  id?: uuid
  token?: string
  name?: string
}

export interface SyncResult {
  id: uuid
  token: uuid
  webhooks: SyncWebhook[]
}

export interface SyncSandboxRequest {
  providerName: string
  conduits?: SyncChannels
}

export interface SyncChannels {
  [channel: string]: any
}

export interface SyncWebhook {
  url: string
  token?: string
}
