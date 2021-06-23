// @ts-ignore
import Smooch from 'smooch-core'
import { ConduitInstance, EndpointContent } from '../base/conduit'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { SmoochConfig } from './config'
import { SmoochMessage, SmoochPayload, SmoochContext, SmoochWebhook } from './context'
import { SmoochRenderers } from './renderers'
import { SmoochSenders } from './senders'

export class SmoochConduit extends ConduitInstance<SmoochConfig, SmoochContext> {
  get enableParsers() {
    return true
  }

  private smooch: any
  // private secret!: string

  protected async setupConnection() {
    this.smooch = new Smooch({
      keyId: this.config.keyId,
      secret: this.config.secret,
      scope: 'app'
    })

    // TODO: on the fly webhook creation doesn't work with lazy loading
    /*
    const { webhook }: { webhook: SmoochWebhook } = await this.smooch.webhooks.create({
      target: this.config.externalUrl + this.route(),
      triggers: ['message:appUser']
    })
    this.secret = webhook.secret
    */
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), ...SmoochRenderers]
  }

  protected setupSenders() {
    return SmoochSenders
  }

  protected async map(payload: { context: SmoochPayload; message: SmoochMessage }): Promise<EndpointContent> {
    return {
      content: { type: 'text', text: payload.message.text },
      thread: payload.context.conversation._id,
      sender: payload.context.appUser._id
    }
  }

  protected async context(base: ChannelContext<any>): Promise<SmoochContext> {
    return {
      ...base,
      client: this.smooch,
      messages: []
    }
  }
}
