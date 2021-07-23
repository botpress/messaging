import { ConduitInstance, EndpointContent } from '../base/conduit'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { MessengerClient } from './client'
import { MessengerConfig } from './config'
import { MessengerContext } from './context'
import { MessengerRenderers } from './renderers'
import { MessengerSenders } from './senders'

export class MessengerConduit extends ConduitInstance<MessengerConfig, MessengerContext> {
  public client!: MessengerClient

  async initialize() {
    await this.client.setupGreeting()
    await this.client.setupGetStarted()
    await this.client.setupPersistentMenu()
  }

  protected async setupConnection() {
    this.client = new MessengerClient(this.config, this.logger)

    await this.printWebhook()
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), ...MessengerRenderers]
  }

  protected setupSenders() {
    return MessengerSenders
  }

  public async extractEndpoint(payload: any): Promise<EndpointContent> {
    let text
    if (payload.message) {
      text = payload.message.text
    } else if (payload.postback) {
      // For greeting message
      text = payload.postback.payload
    }

    return {
      content: { type: 'text', text },
      identity: payload.recipient.id,
      sender: payload.sender.id
    }
  }

  protected async getContext(base: ChannelContext<any>): Promise<MessengerContext> {
    return {
      ...base,
      client: this.client,
      messages: []
    }
  }
}
