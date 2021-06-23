export interface SyncRequest {
  clientId?: string
  clientToken?: string
  webhooks?: SyncWebhook[]
  conduits?: SyncConduits
  providerName: string
  sandbox?: boolean
}

export interface SyncConduits {
  [channel: string]: any
}

export interface SyncResult {
  clientId?: string
  clientToken?: string
  providerName: string
}

export interface SyncWebhook {
  url: string
}
