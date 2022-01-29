import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { DropdownToChoicesRenderer } from '../base/renderers/dropdown'
import { TypingSender } from '../base/senders/typing'
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

  protected async getContext(base: ChannelContext<any>): Promise<TwilioContext> {
    return {
      ...base,
      messages: [],
      prepareIndexResponse: this.service.prepareIndexResponse.bind(this.service)
    }
  }
}
