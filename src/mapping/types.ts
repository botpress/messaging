import { uuid } from '../base/types'

export type Mapping = {
  clientId: uuid
  channelId: string
  conversationId: string
} & Endpoint

export interface Endpoint {
  foreignAppId?: string
  foreignUserId?: string
  foreignConversationId?: string
}
