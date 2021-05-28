import { uuid } from '../base/types'

export interface Conduit {
  id: uuid
  providerId: uuid
  channelId: uuid
  config: any
}
