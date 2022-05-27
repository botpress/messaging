import { ChoiceContent } from '@botpress/messaging-content'
import { ChoicesRenderer } from '../../base/renderers/choices'
import { MessengerContext } from '../context'

export class MessengerChoicesRenderer extends ChoicesRenderer {
  renderChoice(context: MessengerContext, payload: ChoiceContent): void {
    const message = context.messages[0]

    message.quick_replies = payload.choices.map((c) => ({
      content_type: 'text',
      title: c.title,
      payload: c.value
    }))
  }
}
