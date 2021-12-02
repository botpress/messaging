import { TurnContext } from 'botbuilder'
import { Endpoint } from '../base/endpoint'
import { ChannelStream } from '../base/stream'
import { TeamsService } from './service'

export class TeamsStream extends ChannelStream<TeamsService> {
  async setup() {
    this.service.on('send', this.handleSend.bind(this))
  }

  private async handleSend({ scope, endpoint, content }: { scope: string; endpoint: Endpoint; content: any }) {
    const { adapter } = this.service.get(scope)
    const convoRef = await this.service.getRef(endpoint.thread)

    await adapter.continueConversation(convoRef, async (turnContext: TurnContext) => {
      await turnContext.sendActivity({ text: content.text })
    })
  }
}
