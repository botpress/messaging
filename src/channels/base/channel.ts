import { Router } from 'express'
import { ConversationService } from '../../conversations/service'
import { KvsService } from '../../kvs/service'
import { MessageService } from '../../messages/service'
import { ChannelConfig } from './config'

export abstract class Channel {
  abstract get id(): string

  abstract setup(
    config: ChannelConfig,
    kvsService: KvsService,
    conversationService: ConversationService,
    messagesService: MessageService,
    router: Router
  ): void

  abstract send(conversationId: string, payload: any): Promise<void>
}
