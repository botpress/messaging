import Vonage from '@vonage/server-sdk'
import { ConduitInstance, EndpointContent } from '../base/conduit'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { TypingSender } from '../base/senders/typing'
import { VonageConfig } from './config'
import { VonageContext } from './context'
import { VonageRenderers } from './renderers'
import { VonageSenders } from './senders'
import { VonageRequestBody } from './types'

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

    await this.printWebhook('inbound')
    await this.printWebhook('status')
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), ...VonageRenderers]
  }

  protected setupSenders() {
    return [new TypingSender(), ...VonageSenders]
  }

  public async extractEndpoint(payload: VonageRequestBody): Promise<EndpointContent> {
    const identity = payload.to.number
    const sender = payload.from.number

    const messageContent = payload.message.content

    let content = {}
    switch (messageContent.type) {
      case 'text':
        const index = Number(messageContent.text)
        const text = this.handleIndexResponse(index, identity, sender) || messageContent.text
        content = { type: 'text', text }
        break
      case 'audio':
        // We have to take for granted that all messages of type audio are voice messages
        // since Vonage does not differentiate the two.
        content = {
          type: 'voice',
          audio: messageContent.audio!.url
        }
        break
      default:
        break
    }

    return {
      content,
      identity,
      sender
    }
  }

  protected async getContext(base: ChannelContext<Vonage>): Promise<VonageContext> {
    return {
      ...base,
      client: this.vonage,
      messages: [],
      isSandbox: !!this.config.useTestingApi,
      prepareIndexResponse: this.prepareIndexResponse.bind(this)
    }
  }
}
