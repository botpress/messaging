export interface SyncRequest {
  providerName: string
  conduits?: SyncConduits
  clientId?: string
  clientToken?: string
  webhooks?: SyncWebhook[]
}

export interface SyncResult {
  providerName: string
  clientId: string
  clientToken?: string
}

export interface SyncSandboxRequest {
  providerName: string
  conduits?: SyncConduits
}

export interface SyncConduits {
  [channel: string]: any
}

export interface SyncWebhook {
  url: string
}
