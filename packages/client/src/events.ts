import { Message, uuid } from '@botpress/messaging-base'

/**
 * Generic interface for all events that concern a messaging user
 */
export interface UserEvent {
  /** Id of the user related to this event */
  userId: uuid
}

/**
 * Generic interface for all events that concern a messaging conversation
 */
export interface ConversationEvent extends UserEvent {
  /** Id of the conversation related to this event */
  conversationId: uuid
}

/**
 * Generic inteface for all events that happen on a channel
 */
export interface ChannelEvent extends ConversationEvent {
  /** Channel where this event happened */
  channel: string
}

/**
 * Generic interface for all events that concern a specific message
 */
export interface MessageEvent extends ChannelEvent {
  /** Id of the message releated to this event */
  messageId: uuid
}

/**
 * Webhook event that is triggered when a user is created
 */
export interface UserNewEvent extends UserEvent {}

/**
 * Webhook event that is triggered when a new message is created
 */
export interface MessageNewEvent extends ChannelEvent {
  /** Content of the new message */
  message: Message
  /** Indicates if the responses to this message are currently being collected by a converse request */
  collect: boolean
}

/**
 * Webhook event that is triggered when a new conversation is started (e.g. proactive trigger)
 */
export interface ConversationStartedEvent extends ChannelEvent {}

/**
 * Webhook event that is triggered when a user submits feedback for a message
 */
export interface MessageFeedbackEvent extends MessageEvent {
  /** Value of the feedback provided by the use (1 or -1) */
  feedback: number
}
