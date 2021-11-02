import yn from 'yn'
import { ConduitInstance, EndpointContent } from '../base/conduit'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { DropdownToChoicesRenderer } from '../base/renderers/dropdown'
import { MessengerChannel } from './channel'
import { MessengerClient } from './client'
import { MessengerConfig } from './config'
import { MessengerContext } from './context'
import { MessengerRenderers } from './renderers'
import { MessengerSenders } from './senders'

export class MessengerConduit extends ConduitInstance<MessengerConfig, MessengerContext> {
  public client!: MessengerClient

  async initialize() {
    await this.client.setupGreeting()
    await this.client.setupGetStarted()
    await this.client.setupPersistentMenu()
  }

  protected async setupConnection() {
    this.client = new MessengerClient(this.config, this.logger)

    // Legacy stuff
    if (yn(process.env.SPINNED)) {
      const conduit = await this.app.conduits.get(this.conduitId)
      const provider = await this.app.providers.getById(conduit!.providerId)
      const channel = this.app.channels.getById(conduit!.channelId) as MessengerChannel

      try {
        const pageId = await this.client.getPageId()
        channel.registerPageId(pageId, provider!.name)
      } catch {
        // when in live mode this call can fail. we can work around it for new users since they are supposed to use the botId in the url
        // we don't show an error because this is correct usage
      }
    }

    await this.printWebhook()
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), new DropdownToChoicesRenderer(), ...MessengerRenderers]
  }

  protected setupSenders() {
    return MessengerSenders
  }

  public async extractEndpoint(payload: any): Promise<EndpointContent> {
    const postback = payload.postback?.payload
    let content

    if (payload.message?.quick_reply) {
      content = {
        type: 'quick_reply',
        text: payload.message.text,
        payload: payload.message.quick_reply.payload
      }
    } else if (payload.message) {
      content = { type: 'text', text: payload.message.text }
    } else if (postback?.startsWith('postback::')) {
      content = { type: 'postback', payload: postback.replace('postback::', '') }
    } else if (postback?.startsWith('say::')) {
      content = { type: 'say_something', text: postback.replace('say::', '') }
    } else {
      content = { type: 'text', text: postback }
    }

    return {
      content,
      identity: payload.recipient.id,
      sender: payload.sender.id
    }
  }

  protected async getContext(base: ChannelContext<any>): Promise<MessengerContext> {
    return {
      ...base,
      client: this.client,
      messages: []
    }
  }
}
