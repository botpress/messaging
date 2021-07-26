import Vonage from '@vonage/server-sdk'
import { ContentType } from '../../content/types'
import { ConduitInstance, EndpointContent } from '../base/conduit'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { DropdownToChoicesRenderer } from '../base/renderers/dropdown'
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
    return [new CardToCarouselRenderer(), new DropdownToChoicesRenderer(), ...VonageRenderers]
  }

  protected setupSenders() {
    return [new TypingSender(), ...VonageSenders]
  }

  public async extractEndpoint(payload: VonageRequestBody): Promise<EndpointContent> {
    const identity = payload.to.number
    const sender = payload.from.number

    const messageContent = payload.message.content

    let content: ContentType = { type: 'text', text: undefined! }
    // TODO: Improve Vonage SDK typings
    switch (messageContent.type as any) {
      case 'text':
        const index = Number(messageContent.text)
        const text = this.handleIndexResponse(index, identity, sender) || messageContent.text
        content = { type: 'text', text: <any>text }
        break
      case 'audio':
        // We have to take for granted that all messages of type audio are voice messages
        // since Vonage does not differentiate the two.
        content = {
          type: 'voice',
          audio: messageContent.audio!.url
        }
        break
      case 'button':
        content = { type: 'text', text: (<any>messageContent).button.text }
        break
      case 'image':
        content = {
          type: 'image',
          image: messageContent.image!.url,
          title: messageContent.image!.caption
        }
        break
      case 'video':
        content = {
          type: 'video',
          video: messageContent.video!.url,
          title: (<any>messageContent).video!.caption
        }
        break
      case 'file':
        content = {
          type: 'file',
          title: messageContent.file!.caption,
          file: messageContent.file!.url
        }
        break
      case 'location':
        content = {
          type: 'location',
          latitude: (<any>messageContent).location!.lat,
          longitude: (<any>messageContent).location!.long
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
