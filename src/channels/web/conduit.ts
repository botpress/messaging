import axios from 'axios'
import { Conduit, EndpointContent } from '../base/conduit'
import { ChannelContext } from '../base/context'

export class WebConduit extends Conduit<any, any> {
  protected async setupConnection() {}

  async receive(payload: any) {
    const message = await this.app.messages.create(payload.conversationId, payload.content, payload.userId)

    const post = {
      client: { id: this.clientId },
      channel: { id: this.channel.id, name: this.channel.name },
      user: { id: payload.userId },
      conversation: await this.app.conversations.get(payload.conversationId),
      message
    }
    this.loggerIn.debug('Web received message', post)

    const webhooks = await this.app.webhooks.list(this.clientId)
    for (const webhook of webhooks) {
      await axios.post(webhook.url, post)
    }
  }

  async send(conversationId: string, payload: any): Promise<void> {
    const message = await this.app.messages.create(conversationId, payload, payload.userId)

    const post = {
      client: { id: this.clientId },
      channel: { id: this.channel.id, name: this.channel.name },
      user: { id: payload.userId },
      conversation: await this.app.conversations.get(conversationId),
      message
    }
    this.loggerOut.debug('Web sending message', post)

    // TODO: don't hardcode this
    await axios.post('http://localhost:3000/api/v1/bots/gggg/mod/channel-web/webhook', post)
  }

  protected setupRenderers() {
    return []
  }

  protected setupSenders() {
    return []
  }

  protected async map(payload: any): Promise<EndpointContent> {
    return <any>{}
  }

  protected async context(base: ChannelContext<any>): Promise<any> {
    return {}
  }
}
