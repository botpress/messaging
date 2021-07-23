import { MessagingClient } from '@botpress/messaging-client'

export class BotpressWebchat {
  public client!: MessagingClient

  async setup() {
    // eslint-disable-next-line no-console
    console.log('This is the botpress webchat!')

    this.client = new MessagingClient({ url: 'my-messaging.net' })
    await this.client.chat.reply('', '', {})
  }
}
