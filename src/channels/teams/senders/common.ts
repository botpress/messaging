import { TurnContext } from 'botbuilder'
import { CommonSender } from '../../base/senders/common'
import { TeamsContext } from '../context'

export class TeamsCommonSender extends CommonSender {
  async send(context: TeamsContext) {
    for (const message of context.messages) {
      await context.client.continueConversation(context.convoRef, async (turnContext: TurnContext) => {
        await turnContext.sendActivity(message)
      })
    }
  }
}
