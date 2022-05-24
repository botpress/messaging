import { uuid } from '@botpress/base'

export interface Conduit {
  id: uuid
  providerId: uuid
  channelId: uuid
  config: any
}
