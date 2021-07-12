import { ChoiceContent } from '../../../content/types'
import { ChoicesRenderer } from '../../base/renderers/choices'
import { VonageContext } from '../context'

export class VonageChoicesRenderer extends ChoicesRenderer {
  renderChoice(context: VonageContext, payload: ChoiceContent) {
    const message = context.messages[0]

    message.content.text = `${message.content.text}\n\n${payload.choices
      .map(({ title }, idx) => `*(${idx + 1})* ${title}`)
      .join('\n')}`

    if (context.identity && context.sender) {
      context.prepareIndexResponse(context.identity, context.sender, context.payload.choices)
    }
  }
}
