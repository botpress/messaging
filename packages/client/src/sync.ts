import { SyncResult, SyncRequest } from '@botpress/messaging-base'
import { BaseClient } from './base'

export class SyncClient extends BaseClient {
  async sync(config: SyncRequest): Promise<SyncResult> {
    return (await this.http.post('/sync', config)).data
  }
}
