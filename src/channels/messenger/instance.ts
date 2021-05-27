import { ChannelContext } from '../base/context'
import { Instance, EndpointContent } from '../base/instance'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { MessengerClient } from './client'
import { MessengerConfig } from './config'
import { MessengerContext } from './context'
import { MessengerRenderers } from './renderers'
import { MessengerSenders } from './senders'

export class MessengerInstance extends Instance<MessengerConfig, MessengerContext> {
  private client!: MessengerClient

  protected async setupConnection() {
    this.client = new MessengerClient(this.config)
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), ...MessengerRenderers]
  }

  protected setupSenders() {
    return MessengerSenders
  }

  protected async map(payload: any): Promise<EndpointContent> {
    return {
      content: { type: 'text', text: payload.message.text },
      foreignAppId: payload.recipient.id,
      foreignUserId: payload.sender.id
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
