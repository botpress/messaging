import axios from 'axios'
import { Endpoint } from '..'
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
    await this.sendAction(scope, endpoint, 'mark_seen')
  }

  public async sendMessage(scope: string, endpoint: Endpoint, message: any) {
    await this.post(scope, endpoint, { message })
  }

  public async sendAction(scope: string, endpoint: Endpoint, action: string) {
    await this.post(scope, endpoint, { sender_action: action })
  }

  private async post(scope: string, endpoint: Endpoint, data: any) {
    const { config } = this.service.get(scope)

    await axios.post(
      'https://graph.facebook.com/v12.0/me/messages',
      {
        ...data,
        recipient: {
          id: endpoint.sender
        }
      },
      { params: { access_token: config.accessToken } }
    )
  }

  protected async getContext(base: ChannelContext<any>): Promise<MessengerContext> {
    return {
      ...base,
      messages: [],
      stream: this
    }
  }
}
