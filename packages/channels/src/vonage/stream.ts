import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { DropdownToChoicesRenderer } from '../base/renderers/dropdown'
import { TypingSender } from '../base/senders/typing'
import { ChannelStream } from '../base/stream'
import { VonageContext } from './context'
import { VonageRenderers } from './renderers'
import { VonageSenders } from './senders'
import { VonageService } from './service'

export class VonageStream extends ChannelStream<VonageService, VonageContext> {
  get renderers() {
    return [new CardToCarouselRenderer(), new DropdownToChoicesRenderer(), ...VonageRenderers]
  }

  get senders() {
    return [new TypingSender(), ...VonageSenders]
  }

  protected async getContext(base: ChannelContext<any>): Promise<VonageContext> {
    return {
      ...base,
      messages: []
    }
  }
}
