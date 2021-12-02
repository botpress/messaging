import { Endpoint } from '../base/endpoint'
import { SmoochService } from './service'

export class SmoochStream {
  constructor(private readonly service: SmoochService) {}

  async setup() {
    this.service.on('send', this.handleSend.bind(this))
  }

  private async handleSend({ scope, endpoint, content }: { scope: string; endpoint: Endpoint; content: any }) {
    const { smooch } = this.service.get(scope)

    await smooch.appUsers.sendMessage({
      appId: smooch.keyId,
      userId: endpoint.sender,
      message: { type: 'text', text: content.text, role: 'appMaker' }
    })
  }
}
