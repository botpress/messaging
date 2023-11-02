import axios from 'axios'
import { ChannelTestError, Endpoint } from '..'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { DropdownToChoicesRenderer } from '../base/renderers/dropdown'
import { ChannelReceiveEvent, ChannelTestEvent } from '../base/service'
import { ChannelStream } from '../base/stream'
import { WhatsappContext } from './context'
import { WhatsappRenderers } from './renderers'
import { WhatsappSenders } from './senders'
import { WhatsappService } from './service'
import { WhatsappPhoneNumberInfo } from './whatsapp'

const GRAPH_URL = 'https://graph.facebook.com/v18.0'

export class WhatsappStream extends ChannelStream<WhatsappService, WhatsappContext> {
  get renderers() {
    return [new CardToCarouselRenderer(), new DropdownToChoicesRenderer(), ...WhatsappRenderers]
  }

  get senders() {
    return WhatsappSenders
  }

  async setup() {
    await super.setup()

    this.service.on('receive', this.handleReceive.bind(this))
    this.service.on('test', this.handleTest.bind(this))
  }

  private async handleTest({ scope }: ChannelTestEvent) {
    const { config } = this.service.get(scope)

    let info: WhatsappPhoneNumberInfo
    try {
      info = await this.fetchPhoneNumberById(scope)
    } catch {
      throw new ChannelTestError('unable to reach whatsapp with the provided access token', 'whatsapp', 'accessToken')
    }

    if (info.id !== config.phoneNumberId) {
      throw new ChannelTestError('phone number id does not match provided access token', 'whatsapp', 'phoneNumberId')
    }

    try {
      await this.fetchAppInfo(scope)
    } catch {
      throw new ChannelTestError('app id does not match provided access token', 'whatsapp', 'appId')
    }
  }

  protected async handleReceive({ scope, endpoint, content }: ChannelReceiveEvent) {
    await this.markRead(scope, endpoint, content)
  }

  public async sendMessage(scope: string, endpoint: Endpoint, message: any) {
    await this.post(scope, endpoint, { message })
  }

  public async markRead(scope: string, endpoint: Endpoint, message: any) {
    await this.post(scope, endpoint, { message: { status: 'read', message_id: message.id }})
  }

  private async post(scope: string, endpoint: Endpoint, data: any) {
    const { config } = this.service.get(scope)

    await axios.post(
      `${GRAPH_URL}/${config.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: endpoint.sender,
        ...data.message
      },
      {
        headers: {
          Authorization: `Bearer ${config.accessToken}`
        }
      }
    )
  }

  private async fetchPhoneNumberById(scope: string): Promise<any> {
    const { config } = this.service.get(scope)

    const response = await axios.get(`${GRAPH_URL}/${config.phoneNumberId}`, {
      headers: {
        Authorization: `Bearer ${config.accessToken}`
      }
    })
    return response.data
  }

  private async fetchAppInfo(scope: string): Promise<any> {
    const { config } = this.service.get(scope)

    return (await axios.get(`${GRAPH_URL}/${config.appId}`, { params: { access_token: config.accessToken } })).data
  }

  protected async getContext(base: ChannelContext<any>): Promise<WhatsappContext> {
    return {
      ...base,
      messages: [],
      stream: this,
      prepareIndexResponse: this.service.prepareIndexResponse.bind(this.service)
    }
  }
}
