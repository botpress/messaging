export interface SmoochRequestBody {
  app: { id: string }
  webhook: { id: string; version: string }
  events: SmoochEvent[]
}

export type SmoochEvent = SmoochMessageEvent | SmoochPostbackEvent

export interface SmoochBaseEvent {
  id: string
  createdAt: string
  type: string
  payload: any
}

export interface SmoochMessageEvent extends SmoochBaseEvent {
  type: 'conversation:message'
  payload: {
    conversation: { id: string; type: string }
    message: {
      id: string
      received: string
      author: {
        userId: string
        displayName: string
        type: string
        user: { id: string }
      }
      content: { type: string } & any
      source: {
        integrationId: string
        originalMessageId: string
        originalMessageTimestamp: string
        type: string
      }
    }
  }
}

export interface SmoochPostbackEvent extends SmoochBaseEvent {
  type: 'conversation:postback'
  payload: {
    conversation: { id: string; type: string }
    postback: { payload: string }
    user: { id: string }
    source: { type: string; integrationId: string }
  }
}

export interface SmoochCard {
  title: string
  description?: string
  mediaUrl?: string
  actions: SmoochAction[]
}

export type SmoochAction = SmoochLinkAction | SmoochPostbackAction | SmoochReplyAction

export interface SmoochBaseAction {
  type: string
  text: string
}

export interface SmoochLinkAction extends SmoochBaseAction {
  type: 'link'
  uri: string
}

export interface SmoochPostbackAction extends SmoochBaseAction {
  type: 'postback'
  payload: string
}

export interface SmoochReplyAction extends SmoochBaseAction {
  type: 'reply'
  payload: string
}

export type SmoochContent =
  | SmoochTextContent
  | SmoochImageContent
  | SmoochCarouselContent
  | SmoochFileContent
  | SmoochLocationContent

export interface SmoochBaseContent {
  type: string
  actions?: SmoochAction[]
}

export interface SmoochTextContent extends SmoochBaseContent {
  type: 'text'
  text: string
}

export interface SmoochImageContent extends SmoochBaseContent {
  type: 'image'
  mediaUrl: string
  text?: string
}

export interface SmoochCarouselContent extends SmoochBaseContent {
  type: 'carousel'
  items: SmoochCard[]
}

export interface SmoochFileContent extends SmoochBaseContent {
  type: 'file'
  mediaUrl: string
  text?: string
}

export interface SmoochLocationContent extends SmoochBaseContent {
  type: 'location'
  coordinates: {
    lat: number
    long: number
  }
  location?: {
    address?: string
    name?: string
  }
}
