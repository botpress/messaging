import { ChannelMessage, ChannelToFrom, MessageSendResponse } from '@vonage/server-sdk'

export interface VonageRequestBody extends MessageSendResponse {
  to: ChannelToFrom
  from: ChannelToFrom
  message: ChannelMessage
  timestamp: string
}
