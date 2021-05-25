import { ChoiceContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { VonageContext } from '../context'

export class VonageChoicesRenderer implements ChannelRenderer<VonageContext> {
  get priority(): number {
    return 1
  }

  handles(context: VonageContext): boolean {
    return !!(context.payload.choices?.length && context.messages.length > 0)
  }

  render(context: VonageContext) {
    // TODO: Add a whole new message instead of modifying the text?

    const message = context.messages[0]
    const payload = context.payload as ChoiceContent

    message.content.text = `${message.content.text}\n\n${payload.choices
      .map(({ title }, idx) => `*(${idx + 1})* ${title}`)
      .join('\n')}`

    // TODO: reimpl
    // context.prepareIndexResponse(context.event, context.payload.choices)
  }
}
