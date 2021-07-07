import { ChoiceContent } from '../../../content/types'
import { ChoicesRenderer } from '../../base/renderers/choices'
import { TwilioContext } from '../context'

export class TwilioChoicesRenderer extends ChoicesRenderer {
  async renderChoice(context: TwilioContext, payload: ChoiceContent) {
    if (!context.messages.length) {
      context.messages.push({})
    }

    const message = context.messages[0]

    message.body = `${message.body || ''}\n\n${payload.choices
      .map(({ title }, idx) => `${idx + 1}. ${title}`)
      .join('\n')}`

    if (context.identity && context.sender) {
      await context.prepareIndexResponse(context.identity, context.sender, context.payload.choices)
    }
  }
}
