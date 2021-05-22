// @ts-ignore
import Smooch from 'smooch-core'
import { Channel, EndpointContent } from '../base/channel'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { SmoochConfig } from './config'
import { SmoochMessage, SmoochPayload, SmoochContext, SmoochWebhook } from './context'
import { SmoochRenderers } from './renderers'
import { SmoochSenders } from './senders'

export class ChannelSmooch extends Channel<SmoochConfig, SmoochContext> {
  get id() {
    return 'smooch'
  }

  get enableParsers() {
    return true
  }

  private smooch: any
  private secret!: string

  protected async setupConnection() {
    this.smooch = new Smooch({
      keyId: this.config.keyId,
      secret: this.config.secret,
      scope: 'app'
    })

    this.router.post('/', async (req, res) => {
      if (req.headers['x-api-key'] === this.secret) {
        const body = req.body as SmoochPayload
        for (const message of body.messages) {
          await this.receive({ context: body, message })
        }
        res.sendStatus(200)
      } else {
        res.status(401).send('Auth token invalid')
      }
    })

    const { webhook }: { webhook: SmoochWebhook } = await this.smooch.webhooks.create({
      target: this.config.externalUrl + this.route(),
      triggers: ['message:appUser']
    })
    this.secret = webhook.secret

    console.log(`Smooch webhook listening at ${this.config.externalUrl + this.route()}`)
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
      foreignConversationId: payload.context.conversation._id,
      foreignUserId: payload.context.appUser._id
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
