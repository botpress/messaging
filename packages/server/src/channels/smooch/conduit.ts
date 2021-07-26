// @ts-ignore
import Smooch from 'smooch-core'
import { ConduitInstance, EndpointContent } from '../base/conduit'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { DropdownToChoicesRenderer } from '../base/renderers/dropdown'
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
    await this.printWebhook()
  }

  private async setupWebhook() {
    const target = await this.getRoute()

    try {
      // Note: creating a webhook with the same url will not create a new webhook but return the already existing one
      const { webhook }: { webhook: SmoochWebhook } = await this.smooch.webhooks.create({
        target,
        triggers: ['message:appUser']
      })

      this.secret = webhook.secret
    } catch (err) {
      this.logger.error('An error occurred when creating the webhook.', (err as Error).message)
    }
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), new DropdownToChoicesRenderer(), ...SmoochRenderers]
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

  protected async getContext(base: ChannelContext<any>): Promise<SmoochContext> {
    return {
      ...base,
      client: this.smooch,
      messages: []
    }
  }
}
