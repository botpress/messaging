import { ChannelContext } from '../base/context'
import { ChannelRenderer } from '../base/renderer'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { DropdownToChoicesRenderer } from '../base/renderers/dropdown'
import { ChannelSender } from '../base/sender'
import { TypingSender } from '../base/senders/typing'
import { ChannelStreamRenderers } from '../base/stream'
import { TwilioContext } from './context'
import { TwilioRenderers } from './renderers'
import { TwilioSenders } from './senders'
import { TwilioService } from './service'

export class TwilioStream extends ChannelStreamRenderers<TwilioService, TwilioContext> {
  get renderers(): ChannelRenderer<ChannelContext<any>>[] {
    return [new CardToCarouselRenderer(), new DropdownToChoicesRenderer(), ...TwilioRenderers]
  }

  get senders(): ChannelSender<ChannelContext<any>>[] {
    return [new TypingSender(), ...TwilioSenders]
  }

  protected async getContext(base: ChannelContext<any>): Promise<TwilioContext> {
    return {
      ...base,
      messages: [],
      prepareIndexResponse: this.prepareIndexResponse.bind(this)
    }
  }
}
