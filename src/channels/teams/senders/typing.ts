import { TurnContext } from 'botbuilder'
import { ChannelSender } from '../../base/sender'
import { TeamsContext } from '../context'

export class TeamsTypingSender implements ChannelSender<TeamsContext> {
  get priority(): number {
    return -1
  }

  handles(context: TeamsContext): boolean {
    const typing = context.payload.typing
    return context.handlers.length > 0 && (typing === undefined || typing === true)
  }

  async send(context: TeamsContext) {
    const delay = context.payload.delay ?? 1000

    await context.client.continueConversation(context.convoRef, async (turnContext: TurnContext) => {
      await turnContext.sendActivity({ type: 'typing' })
    })

    // TODO: Not working??
    // await Promise.delay(delay)
  }
}
