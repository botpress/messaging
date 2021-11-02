// @ts-ignore
import Smooch from 'smooch-core'
import yn from 'yn'
import { ConduitInstance, EndpointContent } from '../base/conduit'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { DropdownToChoicesRenderer } from '../base/renderers/dropdown'
import { SmoochConfig } from './config'
import { SmoochMessage, SmoochPayload, SmoochContext, SmoochWebhook, SmoochAction } from './context'
import { SmoochRenderers } from './renderers'
import { SmoochSenders } from './senders'

export const SAY_PREFIX = 'say::'
export const POSTBACK_PREFIX = 'postback::'

export class SmoochConduit extends ConduitInstance<SmoochConfig, SmoochContext> {
  private smooch: any
  public secret!: string

  async initialize() {
    const target = await this.getRoute()
    const { webhooks } = await this.smooch.webhooks.list()

    if (yn(process.env.SPINNED)) {
      const legacyWh = webhooks.find((x: any) => x.target?.includes('/mod/channel-smooch'))
      if (legacyWh) {
        await this.smooch.webhooks.delete(legacyWh._id)
        this.logger.info('Deleted legacy webhook', legacyWh.target)
      }
    }

    let webhook = webhooks.find((x: any) => x.target === target)
    if (!webhook) {
      webhook = (
        await this.smooch.webhooks.create({
          target,
          triggers: ['message:appUser', 'postback']
        })
      ).webhook
    }

    this.secret = webhook.secret
  }

  protected async setupConnection() {
    this.smooch = new Smooch({
      keyId: this.config.keyId,
      secret: this.config.secret,
      scope: 'app'
    })

    const { webhooks } = await this.smooch.webhooks.list()
    const target = await this.getRoute()
    const webhook = webhooks.find((x: any) => x.target === target)
    this.secret = webhook?.secret

    await this.printWebhook()
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), new DropdownToChoicesRenderer(), ...SmoochRenderers]
  }

  protected setupSenders() {
    return SmoochSenders
  }

  public async extractEndpoint(payload: {
    context: SmoochPayload
    message: SmoochMessage
    action: SmoochAction
  }): Promise<EndpointContent> {
    const postback = payload.message.action?.payload
    let content

    if (postback?.startsWith(SAY_PREFIX)) {
      content = { type: 'say_something', text: postback.replace(SAY_PREFIX, '') }
    } else if (postback?.startsWith(POSTBACK_PREFIX)) {
      content = { type: 'postback', payload: postback.replace(POSTBACK_PREFIX, '') }
    } else {
      content = { type: 'text', text: payload.message.text }
    }

    return {
      content,
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
