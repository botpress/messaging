import { uuid } from '@botpress/messaging-base'
import { Streamer } from '../base/streamer'
import { ChannelService } from '../channels/service'
import { ConversationService } from '../conversations/service'
import { ConverseService } from '../converse/service'
import { MappingService } from '../mapping/service'
import { MessageCreatedEvent, MessageEvents, MessageFeedbackEvent } from './events'
import { MessageService } from './service'

export class MessageStream {
  constructor(
    private streamer: Streamer,
    private channels: ChannelService,
    private conversations: ConversationService,
    private messages: MessageService,
    private converse: ConverseService,
    private mapping: MappingService
  ) {}

  async setup() {
    this.messages.events.on(MessageEvents.Created, this.handleMessageCreate.bind(this))
    this.messages.events.on(MessageEvents.Feedback, this.handleMessageFeedback.bind(this))
  }

  private async handleMessageCreate({ message, source }: MessageCreatedEvent) {
    const conversation = await this.conversations.get(message.conversationId)
    const collect = this.converse.isCollectingForMessage(message.id)

    await this.streamer.stream(
      'message.new',
      {
        conversationId: conversation.id,
        channel: await this.getChannel(conversation.id),
        ...(collect ? { collect } : {}),
        message
      },
      conversation.clientId,
      conversation.userId,
      source
    )
  }

  private async handleMessageFeedback({ messageId, feedback }: MessageFeedbackEvent) {
    const message = await this.messages.get(messageId)
    const conversation = await this.conversations.get(message.conversationId)

    await this.streamer.stream(
      'message.feedback',
      {
        userId: conversation.userId,
        conversationId: conversation.id,
        channel: await this.getChannel(conversation.id),
        messageId,
        feedback
      },
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
