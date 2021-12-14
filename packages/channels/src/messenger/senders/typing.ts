import { TypingSender } from '../../base/senders/typing'
import { MessengerContext } from '../context'

export class MessengerTypingSender extends TypingSender {
  async sendIndicator(context: MessengerContext) {
    await context.state.client.sendAction(context.sender, 'typing_on')
  }

  async stopIndicator(context: MessengerContext) {
    await context.state.client.sendAction(context.sender, 'typing_off')
  }
}
