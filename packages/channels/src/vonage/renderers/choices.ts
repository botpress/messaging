import { IndexChoiceType } from '../../base/context'
import { ChoicesRenderer } from '../../base/renderers/choices'
import { ChoiceContent } from '../../content/types'
import { VonageContext } from '../context'

export class VonageChoicesRenderer extends ChoicesRenderer {
  renderChoice(context: VonageContext, payload: ChoiceContent) {
    const message = context.messages[0]

    message.content.text = `${message.content.text}\n\n${payload.choices
      .map(({ title }, idx) => `*(${idx + 1})* ${title}`)
      .join('\n')}`

    context.prepareIndexResponse(
      context.scope,
      context.identity!,
      context.sender!,
      payload.choices.map((x) => ({ type: IndexChoiceType.QuickReply, ...x }))
    )
  }
}
