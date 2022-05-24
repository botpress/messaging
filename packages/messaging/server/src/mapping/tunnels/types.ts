import { uuid } from '@botpress/base'

export interface Tunnel {
  id: uuid
  clientId: uuid
  channelId?: uuid
  customChannelName?: string
}
