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
  postback?: {
    mid: string
    payload: string
    title: string
  }
}

export interface MessengerCard {
  title: string
  image_url?: string
  subtitle?: string
  buttons: MessengerButton[]
}

export interface MessengerButton {
  type: 'web_url' | 'postback'
  title?: string
  payload?: string
  url?: string
}
