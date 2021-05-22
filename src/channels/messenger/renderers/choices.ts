import { ChoiceContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { MessengerContext } from '../context'

export class MessengerChoicesRenderer implements ChannelRenderer<MessengerContext> {
  get priority(): number {
    return 1
  }

  handles(context: MessengerContext): boolean {
    return !!(context.payload.choices && context.messages.length > 0)
  }

  render(context: MessengerContext) {
    const message = context.messages[0]
    const payload = context.payload as ChoiceContent

    message.quick_replies = payload.choices.map((c) => ({
      content_type: 'text',
      title: c.title,
      payload: c.value.toUpperCase()
    }))
  }
}
