import { BaseClient } from './base'

export class SyncClient extends BaseClient {
  async sync(config: SyncRequest): Promise<SyncResult> {
    return (await this.http.post('/sync', config)).data
  }
}

// TODO: these typings are copy pasted. Maybe a "common" package would be good for this?
export interface SyncRequest {
  channels?: SyncChannels
  webhooks?: SyncWebhook[]
  id?: string
  token?: string
  name?: string
}

export interface SyncResult {
  id: string
  token: string
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
