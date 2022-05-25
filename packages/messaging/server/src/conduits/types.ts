import { uuid } from '@botpress/framework'

export interface Conduit {
  id: uuid
  providerId: uuid
  channelId: uuid
  config: any
}
