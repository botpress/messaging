import { TurnContext } from 'botbuilder'
import { ChannelSendEvent } from '../base/service'
import { ChannelStream } from '../base/stream'
import { TeamsService } from './service'

export class TeamsStream extends ChannelStream<TeamsService> {
  protected async handleSend({ scope, endpoint, content }: ChannelSendEvent) {
    const { adapter } = this.service.get(scope)
    const convoRef = await this.service.getRef(endpoint.thread)

    await adapter.continueConversation(convoRef, async (turnContext: TurnContext) => {
      await turnContext.sendActivity({ text: content.text })
    })
  }
}
