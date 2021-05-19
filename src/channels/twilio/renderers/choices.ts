import { ChannelRenderer } from '../../base/renderer'
import { TwilioContext } from '../context'

export class TwilioChoicesRenderer implements ChannelRenderer<TwilioContext> {
  get priority(): number {
    return 1
  }

  handles(context: TwilioContext): boolean {
    return !!(context.payload.choices?.length && context.messages.length > 0)
  }

  render(context: TwilioContext) {
    const message = context.messages[0]

    message.body = `${message.body}\n\n${context.payload.choices
      .map(({ title }: any, idx: number) => `${idx + 1}. ${title}`)
      .join('\n')}`

    // context.prepareIndexResponse(context.event, context.payload.choices)
  }
}
