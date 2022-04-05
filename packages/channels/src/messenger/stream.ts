import axios from 'axios'
import { ChannelTestError, Endpoint } from '..'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { DropdownToChoicesRenderer } from '../base/renderers/dropdown'
import { ChannelReceiveEvent, ChannelTestEvent } from '../base/service'
import { ChannelStream } from '../base/stream'
import { MessengerContext } from './context'
import { MessengerRenderers } from './renderers'
import { MessengerSenders } from './senders'
import { MessengerService } from './service'

const GRAPH_URL = 'https://graph.facebook.com/v12.0'

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
    this.service.on('test', this.handleTest.bind(this))
  }

  private async handleTest({ scope }: ChannelTestEvent) {
    const { config } = this.service.get(scope)

    let info
    try {
      info = await this.fetchPageInfo(scope)
    } catch {
      throw new ChannelTestError('unable to reach messenger with the provided access token', 'messenger', 'accessToken')
    }

    if (info.id !== config.pageId) {
      throw new ChannelTestError('page id does not match provided access token', 'messenger', 'pageId')
    }

    try {
      await this.fetchAppInfo(scope)
    } catch {
      throw new ChannelTestError('app id does not match provided access token', 'messenger', 'appId')
    }
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
      `${GRAPH_URL}/me/messages`,
      {
        ...data,
        recipient: {
          id: endpoint.sender
        }
      },
      { params: { access_token: config.accessToken } }
    )
  }

  private async fetchPageInfo(scope: string): Promise<{ name: string; id: string }> {
    const { config } = this.service.get(scope)

    return (await axios.get(`${GRAPH_URL}/me`, { params: { access_token: config.accessToken } })).data
  }

  private async fetchAppInfo(scope: string): Promise<any> {
    const { config } = this.service.get(scope)

    return (await axios.get(`${GRAPH_URL}/${config.appId}`, { params: { access_token: config.accessToken } })).data
  }

  protected async getContext(base: ChannelContext<any>): Promise<MessengerContext> {
    return {
      ...base,
      messages: [],
      stream: this
    }
  }
}
