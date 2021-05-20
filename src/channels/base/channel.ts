import { ConversationService } from '../../conversations/service'
import { KvsService } from '../../kvs/service'
import { MessageService } from '../../messages/service'
import { Routers } from '../types'
import { ChannelConfig } from './config'

export abstract class Channel {
  abstract get id(): string

  abstract setup(
    config: ChannelConfig,
    kvsService: KvsService,
    conversationService: ConversationService,
    messagesService: MessageService,
    routers: Routers
  ): Promise<void>

  abstract send(conversationId: string, payload: any): Promise<void>
}
