import { ConversationService } from '../../conversations/service'
import { KvsService } from '../../kvs/service'
import { MessageService } from '../../messages/service'
import { Routers } from '../types'
import { ChannelConfig } from './config'

export abstract class Channel<C extends ChannelConfig> {
  abstract get id(): string

  constructor(
    protected config: C,
    protected kvs: KvsService,
    protected conversations: ConversationService,
    protected messages: MessageService,
    protected routers: Routers
  ) {}

  abstract setup(): Promise<void>

  abstract send(conversationId: string, payload: any): Promise<void>
}
