import { v4 as uuidv4 } from 'uuid'
import { ChoicesRenderer } from '../../base/renderers/choices'
import { ChoiceContent } from '../../content/types'
import { SlackContext } from '../context'

export class SlackChoicesRenderer extends ChoicesRenderer {
  renderChoice(context: SlackContext, payload: ChoiceContent) {
    context.message.blocks?.push({
      type: 'actions',
      elements: payload.choices.map((x) => ({
        type: 'button',
        action_id: `quick_reply${uuidv4()}`,
        text: {
          type: 'plain_text',
          text: x.title
        },
        value: x.value
      }))
    })
  }
}
