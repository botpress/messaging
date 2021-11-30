import { uuid } from '@botpress/messaging-base'

export interface Conduit {
  id: uuid
  providerId: uuid
  channelId: uuid
  config: any
}
