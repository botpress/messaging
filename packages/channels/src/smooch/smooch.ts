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
