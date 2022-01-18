import { Message, uuid } from '@botpress/messaging-base'

export interface UserEvent {
  userId: uuid
}

export interface ConversationEvent extends UserEvent {
  conversationId: uuid
}

export interface ChannelEvent extends ConversationEvent {
  channel: string
}

export interface UserNewEvent extends UserEvent {}

export interface MessageNewEvent extends ChannelEvent {
  message: Message
  collect: boolean
}

export interface ConversationStartedEvent extends ChannelEvent {
  channel: string
}
