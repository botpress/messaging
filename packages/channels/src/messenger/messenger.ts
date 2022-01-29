export class Messenger {}

export interface WebhookVerificationQuery {
  hub: {
    mode: string
    verify_token: string
    challenge: string
  }
}

export interface MessengerPayload {
  object: string
  entry: MessengerEntry[]
}

export interface MessengerEntry {
  id: string
  time: number
  messaging: MessengerMessage[]
}

export interface MessengerMessage {
  sender: { id: string }
  recipient: { id: string }
  timestamp: number
  message?: {
    mid: string
    text: string
    quick_reply?: { payload: string }
  }
  // TODO: better typings
  postback: any
}
