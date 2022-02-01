export interface SmoochEvent {
  id: string
  createdAt: string
  type: string
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

export interface SmoochCard {
  title: string
  description?: string
  mediaUrl?: string
  actions: SmoochAction[]
}

export type SmoochAction = SmoochLinkAction | SmoochPostbackAction

export interface SmoochLinkAction {
  type: 'link'
  text: string
  uri: string
}

export interface SmoochPostbackAction {
  type: 'postback'
  text: string
  payload: string
}
