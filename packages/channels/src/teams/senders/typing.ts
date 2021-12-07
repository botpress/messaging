import { TurnContext } from 'botbuilder'
import { TypingSender } from '../../base/senders/typing'
import { TeamsContext } from '../context'

export class TeamsTypingSender extends TypingSender {
  async sendIndicator(context: TeamsContext) {
    await context.state.adapter.continueConversation(context.convoRef, async (turnContext: TurnContext) => {
      await turnContext.sendActivity({ type: 'typing' })
    })
  }
}
