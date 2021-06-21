export interface SyncRequest {
  clientId?: string
  clientToken?: string
  webhooks?: { url: string }[]
  conduits?: { [channel: string]: any }
  providerName?: string
}

export interface SyncResult {
  clientId: string
  clientToken?: string
  providerName: string
}
