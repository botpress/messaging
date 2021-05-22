import { ChoiceContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { SmoochContext } from '../context'

export class SmoochChoicesRenderer implements ChannelRenderer<SmoochContext> {
  get priority(): number {
    return 1
  }

  handles(context: SmoochContext): boolean {
    return !!(context.payload.choices?.length && context.messages.length > 0)
  }

  async render(context: SmoochContext) {
    const message = context.messages[0]
    const payload = context.payload as ChoiceContent

    message.actions = payload.choices.map((r) => ({ type: 'reply', text: r.title, payload: r.value }))
  }
}
