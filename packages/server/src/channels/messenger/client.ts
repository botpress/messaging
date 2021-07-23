import axios from 'axios'
import _ from 'lodash'
import { MessengerConfig } from './config'
import { MessengerAction } from './types'

export class MessengerClient {
  private readonly http = axios.create({ baseURL: 'https://graph.facebook.com/v3.2/me' })

  constructor(private config: MessengerConfig) {}

  async setupGetStarted(): Promise<void> {
    if (!this.config.getStarted) {
      return
    }

    await this.sendProfile({
      get_started: {
        payload: this.config.getStarted
      }
    })
  }

  async setupGreeting(): Promise<void> {
    if (!this.config.greeting) {
      await this.deleteProfileFields(['greeting'])
      return
    }

    await this.sendProfile({
      greeting: [
        {
          locale: 'default',
          text: this.config.greeting
        }
      ]
    })
  }

  async setupPersistentMenu(): Promise<void> {
    if (!this.config.persistentMenu?.length) {
      await this.deleteProfileFields(['persistent_menu'])
      return
    }

    await this.sendProfile({ persistent_menu: this.config.persistentMenu })
  }

  async sendAction(senderId: string, action: MessengerAction) {
    if (this.config.disabledActions?.includes(action)) {
      return
    }

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

  private async deleteProfileFields(fields: string[]) {
    const endpoint = '/messenger_profile'
    await this.http.delete(endpoint, { params: { access_token: this.config.accessToken }, data: { fields } })
  }

  private async sendProfile(message: any) {
    await this.callEndpoint('/messenger_profile', message)
  }

  private async callEndpoint(endpoint: string, body: any) {
    await this.http.post(endpoint, body, { params: { access_token: this.config.accessToken } })
  }
}
