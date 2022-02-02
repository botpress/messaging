import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { DropdownToChoicesRenderer } from '../base/renderers/dropdown'
import { ChannelStream } from '../base/stream'
import { SmoochContext } from './context'
import { SmoochRenderers } from './renderers'
import { SmoochSenders } from './senders'
import { SmoochService } from './service'

export class SmoochStream extends ChannelStream<SmoochService, SmoochContext> {
  get renderers() {
    return [new CardToCarouselRenderer(), new DropdownToChoicesRenderer(), ...SmoochRenderers]
  }

  get senders() {
    return SmoochSenders
  }

  protected async getContext(base: ChannelContext<any>): Promise<SmoochContext> {
    return {
      ...base,
      messages: []
    }
  }
}
