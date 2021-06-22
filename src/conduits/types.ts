import { uuid } from '../base/types'

export interface Conduit {
  id: uuid
  providerId: uuid
  channelId: uuid
  initialized: Date | undefined
  config: any
}
