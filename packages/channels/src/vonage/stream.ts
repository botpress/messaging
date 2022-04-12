import axios from 'axios'
import { ChannelTestError } from '../base/channel'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { TypingSender } from '../base/senders/typing'
import { ChannelTestEvent } from '../base/service'
import { ChannelStream } from '../base/stream'
import { VonageContext } from './context'
import { VonageRenderers } from './renderers'
import { VonageSenders } from './senders'
import { VonageService } from './service'

export class VonageStream extends ChannelStream<VonageService, VonageContext> {
  get renderers() {
    return [new CardToCarouselRenderer(), ...VonageRenderers]
  }

  get senders() {
    return [new TypingSender(), ...VonageSenders]
  }

  async setup() {
    await super.setup()
    this.service.on('test', this.handleTest.bind(this))
  }

  private async handleTest({ scope }: ChannelTestEvent) {
    const { config } = this.service.get(scope)

    try {
      await axios.get('https://api.nexmo.com/v2/applications', {
        auth: { username: config.apiKey, password: config.apiSecret }
      })
    } catch (e) {
      throw new ChannelTestError(
        'unable to reach vonage using the provided api key and api secret',
        'vonage',
        'apiSecret'
      )
    }
  }

  protected async getContext(base: ChannelContext<any>): Promise<VonageContext> {
    return {
      ...base,
      messages: [],
      prepareIndexResponse: this.service.prepareIndexResponse.bind(this.service)
    }
  }
}
