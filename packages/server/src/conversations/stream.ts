import { uuid } from '@botpress/messaging-base'
import { Streamer } from '../base/streamer'
import { ChannelService } from '../channels/service'
import { MappingService } from '../mapping/service'
import { ConversationCreatedEvent, ConversationEvents, ConversationStartedEvent } from './events'
import { ConversationService } from './service'

export class ConversationStream {
  constructor(
    private streamer: Streamer,
    private channels: ChannelService,
    private conversations: ConversationService,
    private mapping: MappingService
  ) {}

  async setup() {
    this.conversations.events.on(ConversationEvents.Created, this.handleConversationCreated.bind(this))
    this.conversations.events.on(ConversationEvents.Started, this.handleConversationStarted.bind(this))
  }

  private async handleConversationCreated({ conversation }: ConversationCreatedEvent) {
    await this.streamer.stream(
      'conversation.new',
      { conversationId: conversation.id },
      conversation.clientId,
      conversation.userId
    )
  }

  private async handleConversationStarted({ conversationId }: ConversationStartedEvent) {
    const conversation = await this.conversations.get(conversationId)
    await this.streamer.stream(
      'conversation.started',
      { userId: conversation.userId, conversationId, channel: await this.getChannel(conversationId) },
      conversation.clientId
    )
  }

  private async getChannel(conversationId: uuid) {
    const convmaps = await this.mapping.convmap.listByConversationId(conversationId)
    if (convmaps.length === 1) {
      const tunnel = await this.mapping.tunnels.get(convmaps[0].tunnelId)
      return tunnel!.customChannelName ? tunnel!.customChannelName : this.channels.getById(tunnel!.channelId!).meta.name
    } else {
      return 'messaging'
    }
  }
}
