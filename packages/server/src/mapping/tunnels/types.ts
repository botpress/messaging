import { uuid } from '@botpress/messaging-base'

export interface Tunnel {
  id: uuid
  clientId: uuid
  channelId?: uuid
  customChannelName?: string
}
