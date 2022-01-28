import axios from 'axios'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { DropdownToChoicesRenderer } from '../base/renderers/dropdown'
import { ChannelReceiveEvent } from '../base/service'
import { ChannelStream } from '../base/stream'
import { MessengerContext } from './context'
import { MessengerRenderers } from './renderers'
import { MessengerSenders } from './senders'
import { MessengerService } from './service'

export class MessengerStream extends ChannelStream<MessengerService, MessengerContext> {
  get renderers() {
    return [new CardToCarouselRenderer(), new DropdownToChoicesRenderer(), ...MessengerRenderers]
  }

  get senders() {
    return MessengerSenders
  }

  async setup() {
    await super.setup()

    this.service.on('receive', this.handleReceive.bind(this))
  }

  protected async handleReceive({ scope, endpoint }: ChannelReceiveEvent) {
    const { config } = this.service.get(scope)

    await axios.post(
      'https://graph.facebook.com/v12.0/me/messages',
      {
        recipient: {
          id: endpoint.sender
        },
        sender_action: 'mark_seen'
      },
      { params: { access_token: config.accessToken } }
    )
  }

  protected async getContext(base: ChannelContext<any>): Promise<MessengerContext> {
    return {
      ...base
    }
  }
}
