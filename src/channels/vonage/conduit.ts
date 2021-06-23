import Vonage from '@vonage/server-sdk'
import { ConduitInstance, EndpointContent } from '../base/conduit'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { TypingSender } from '../base/senders/typing'
import { VonageConfig } from './config'
import { VonageContext } from './context'
import { VonageRenderers } from './renderers'
import { VonageSenders } from './senders'

export class VonageConduit extends ConduitInstance<VonageConfig, VonageContext> {
  private vonage!: Vonage

  protected async setupConnection() {
    this.vonage = new Vonage(
      {
        apiKey: this.config.apiKey,
        apiSecret: this.config.apiSecret,
        applicationId: this.config.applicationId,
        privateKey: <any>Buffer.from(this.config.privateKey),
        signatureSecret: this.config.signatureSecret
      },
      {
        apiHost: this.config.useTestingApi ? 'https://messages-sandbox.nexmo.com' : 'https://api.nexmo.com'
      }
    )
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), ...VonageRenderers]
  }

  protected setupSenders() {
    return [new TypingSender(), ...VonageSenders]
  }

  protected async map(payload: any): Promise<EndpointContent> {
    return {
      content: { type: 'text', text: payload.message.content.text },
      identity: payload.to.number,
      sender: payload.from.number
    }
  }

  protected async context(base: ChannelContext<any>): Promise<VonageContext> {
    return {
      ...base,
      client: this.vonage,
      messages: [],
      isSandbox: this.config.useTestingApi
    }
  }
}
