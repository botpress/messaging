import { TypingSender } from '../../base/senders/typing'
import { MessengerContext } from '../context'

export class MessengerTypingSender extends TypingSender {
  async sendIndicator(context: MessengerContext) {
    await context.stream.sendAction(context.scope, context, 'typing_on')
  }
}
