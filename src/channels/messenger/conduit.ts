import { ConduitInstance, EndpointContent } from '../base/conduit'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { MessengerClient } from './client'
import { MessengerConfig } from './config'
import { MessengerContext } from './context'
import { MessengerRenderers } from './renderers'
import { MessengerSenders } from './senders'

export class MessengerConduit extends ConduitInstance<MessengerConfig, MessengerContext> {
  private client!: MessengerClient

  protected async setupConnection() {
    this.client = new MessengerClient(this.config)

    await this.printWebhook()
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), ...MessengerRenderers]
  }

  protected setupSenders() {
    return MessengerSenders
  }

  public async extractEndpoint(payload: any): Promise<EndpointContent> {
    return {
      content: { type: 'text', text: payload.message.text },
      identity: payload.recipient.id,
      sender: payload.sender.id
    }
  }

  protected async context(base: ChannelContext<any>): Promise<MessengerContext> {
    return {
      ...base,
      client: this.client,
      messages: []
    }
  }
}
