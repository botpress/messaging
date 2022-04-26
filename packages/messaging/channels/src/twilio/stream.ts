import { ChannelTestError } from '../base/channel'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { DropdownToChoicesRenderer } from '../base/renderers/dropdown'
import { TypingSender } from '../base/senders/typing'
import { ChannelTestEvent } from '../base/service'
import { ChannelStream } from '../base/stream'
import { TwilioContext } from './context'
import { TwilioRenderers } from './renderers'
import { TwilioSenders } from './senders'
import { TwilioService } from './service'

export class TwilioStream extends ChannelStream<TwilioService, TwilioContext> {
  get renderers() {
    return [new CardToCarouselRenderer(), new DropdownToChoicesRenderer(), ...TwilioRenderers]
  }

  get senders() {
    return [new TypingSender(), ...TwilioSenders]
  }

  async setup() {
    await super.setup()
    this.service.on('test', this.handleTest.bind(this))
  }

  private async handleTest({ scope }: ChannelTestEvent) {
    const { twilio, config } = this.service.get(scope)

    try {
      await twilio.api.accounts(config.accountSID).fetch()
    } catch {
      throw new ChannelTestError(
        'unable to reach twilio using the provided account SID and auth token combination',
        'twilio',
        'authToken'
      )
    }
  }

  protected async getContext(base: ChannelContext<any>): Promise<TwilioContext> {
    return {
      ...base,
      messages: [],
      prepareIndexResponse: this.service.prepareIndexResponse.bind(this.service)
    }
  }
}
