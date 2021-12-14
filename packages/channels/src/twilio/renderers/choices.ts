import { IndexChoiceType } from '../../base/context'
import { ChoicesRenderer } from '../../base/renderers/choices'
import { ChoiceContent, ChoiceOption } from '../../content/types'
import { TwilioContext } from '../context'

export class TwilioChoicesRenderer extends ChoicesRenderer {
  renderChoice(context: TwilioContext, payload: ChoiceContent) {
    if (!context.messages.length) {
      context.messages.push({})
    }

    const message = context.messages[0]

    message.body = `${message.body || ''}\n\n${payload.choices
      .map(({ title }, idx) => `${idx + 1}. ${title}`)
      .join('\n')}`

    context.prepareIndexResponse(
      context.scope,
      context.identity,
      context.sender,
      payload.choices.map((x: ChoiceOption) => ({ ...x, type: IndexChoiceType.QuickReply }))
    )
  }
}
