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
  private smooch: any
  public secret!: string

  async initialize() {
    await this.setupWebhook()
  }

  protected async setupConnection() {
    this.smooch = new Smooch({
      keyId: this.config.keyId,
      secret: this.config.secret,
      scope: 'app'
    })

    await this.setupWebhook()
  }

  private async setupWebhook() {
    const target = this.config.webhookUrl || (await this.getRoute())

    // Note: creating a webhook with the same url will not create a new webhook but return the already existing one
    const { webhook }: { webhook: SmoochWebhook } = await this.smooch.webhooks.create({
      target,
      triggers: ['message:appUser']
    })
    this.secret = webhook.secret
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), ...SmoochRenderers]
  }

  protected setupSenders() {
    return SmoochSenders
  }

  public async extractEndpoint(payload: { context: SmoochPayload; message: SmoochMessage }): Promise<EndpointContent> {
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
