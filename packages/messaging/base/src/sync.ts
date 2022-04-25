export interface SyncRequest {
  channels?: SyncChannels
  webhooks?: Omit<SyncWebhook, 'token'>[]
}

export interface SyncResult {
  webhooks: SyncWebhook[]
}

export interface SyncSandboxRequest {
  name: string
  channels?: SyncChannels
}

export interface SyncChannels {
  [channel: string]: any
}

export interface SyncWebhook {
  url: string
  token?: string
}
