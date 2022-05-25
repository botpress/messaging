import { uuid } from '@botpress/framework'

export interface Tunnel {
  id: uuid
  clientId: uuid
  channelId?: uuid
  customChannelName?: string
}
