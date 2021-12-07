import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { ChannelStreamRenderers } from '../base/stream'
import { TeamsContext } from './context'
import { TeamsRenderers } from './renderers'
import { TeamsSenders } from './senders'
import { TeamsService } from './service'

export class TeamsStream extends ChannelStreamRenderers<TeamsService, TeamsContext> {
  get renderers() {
    return [new CardToCarouselRenderer(), ...TeamsRenderers]
  }

  get senders() {
    return TeamsSenders
  }

  protected async getContext(base: ChannelContext<any>): Promise<TeamsContext> {
    return {
      ...base,
      messages: [],
      convoRef: await this.service.getRef(base.thread)
    }
  }
}
