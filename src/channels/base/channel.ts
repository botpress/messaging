import { ConversationService } from '../../conversations/service'
import { KvsService } from '../../kvs/service'
import { MessageService } from '../../messages/service'
import { Routers } from '../types'
import { ChannelConfig } from './config'
import { ChannelContext } from './context'
import { ChannelRenderer } from './renderer'
import { ChannelSender } from './sender'

export abstract class Channel<C extends ChannelConfig, CTX extends ChannelContext<any>> {
  abstract get id(): string

  // TODO: keep this public?
  public config!: C
  protected renderers: ChannelRenderer<CTX>[] = []
  protected senders: ChannelSender<CTX>[] = []

  // TODO: change this
  protected botId = 'default'

  constructor(
    protected kvs: KvsService,
    protected conversations: ConversationService,
    protected messages: MessageService,
    protected routers: Routers
  ) {}

  async setup(): Promise<void> {
    await this.setupConnection()
    this.renderers = this.setupRenderers().sort((a, b) => a.priority - b.priority)
    this.senders = this.setupSenders().sort((a, b) => a.priority - b.priority)
  }

  protected abstract setupConnection(): Promise<void>
  protected abstract setupRenderers(): ChannelRenderer<CTX>[]
  protected abstract setupSenders(): ChannelSender<CTX>[]

  abstract send(conversationId: string, payload: any): Promise<void>
}
