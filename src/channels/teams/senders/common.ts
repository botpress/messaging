import { TurnContext } from 'botbuilder'
import { ChannelSender } from '../../base/sender'
import { TeamsContext } from '../context'

export class TeamsCommonSender implements ChannelSender<TeamsContext> {
  get priority(): number {
    return 0
  }

  handles(context: TeamsContext): boolean {
    return context.handlers.length > 0
  }

  async send(context: TeamsContext) {
    for (const message of context.messages) {
      await context.client.continueConversation(context.convoRef, async (turnContext: TurnContext) => {
        await turnContext.sendActivity(message)
      })
    }
  }
}
