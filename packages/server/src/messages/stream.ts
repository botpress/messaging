import { uuid } from '@botpress/messaging-base'
import { ChannelService } from '../channels/service'
import { ConversationService } from '../conversations/service'
import { ConverseService } from '../converse/service'
import { MappingService } from '../mapping/service'
import { StreamService } from '../stream/service'
import { MessageCreatedEvent, MessageEvents } from './events'
import { MessageService } from './service'

export class MessageStream {
  constructor(
    private channels: ChannelService,
    private conversations: ConversationService,
    private messages: MessageService,
    private converse: ConverseService,
    private mapping: MappingService,
    private stream: StreamService
  ) {}

  async setup() {
    this.messages.events.on(MessageEvents.Created, this.handleMessageCreate.bind(this))
  }

  private async handleMessageCreate({ message, source }: MessageCreatedEvent) {
    const conversation = await this.conversations.get(message.conversationId)

    await this.stream.stream(
      'message.new',
      {
        channel: await this.getChannel(conversation!.id),
        conversationId: conversation!.id,
        collect: this.converse.isCollectingForMessage(message.id),
        message
      },
      conversation!.clientId,
      conversation!.userId,
      source
    )
  }

  private async getChannel(conversationId: uuid) {
    const convmaps = await this.mapping.convmap.listByConversationId(conversationId)
    if (convmaps.length === 1) {
      const tunnel = await this.mapping.tunnels.get(convmaps[0].tunnelId)
      return this.channels.getById(tunnel!.channelId).meta.name
    } else {
      return 'messaging'
    }
  }
}
