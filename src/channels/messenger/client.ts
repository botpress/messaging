import axios from 'axios'
import _ from 'lodash'
import { MessengerConfig } from './config'

export class MessengerClient {
  private readonly http = axios.create({ baseURL: 'https://graph.facebook.com/v3.2/me' })

  constructor(private config: MessengerConfig) {}

  // TODO: typings
  async sendAction(senderId: string, action: any) {
    // TODO: disable actions config

    const body = {
      recipient: {
        id: senderId
      },
      sender_action: action
    }

    await this.callEndpoint('/messages', body)
  }

  async sendMessage(senderId: string, message: { [key: string]: any }) {
    const acceptableKeys = ['text', 'quick_replies', 'metadata', 'attachment']

    const body = {
      recipient: {
        id: senderId
      },
      message: _.pick(message, acceptableKeys)
    }

    await this.callEndpoint('/messages', body)
  }

  private async callEndpoint(endpoint: string, body: any) {
    await this.http.post(endpoint, body, { params: { access_token: this.config.accessToken } })
  }
}
