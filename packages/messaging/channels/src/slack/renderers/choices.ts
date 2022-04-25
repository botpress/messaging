import { v4 as uuidv4 } from 'uuid'
import { ChoicesRenderer } from '../../base/renderers/choices'
import { ChoiceContent } from '../../content/types'
import { SlackContext } from '../context'

export const QUICK_REPLY_PREFIX = 'quick_reply::'

export class SlackChoicesRenderer extends ChoicesRenderer {
  renderChoice(context: SlackContext, payload: ChoiceContent) {
    context.message.blocks.push({
      type: 'actions',
      elements: payload.choices.map((x) => ({
        type: 'button',
        action_id: `${QUICK_REPLY_PREFIX}${uuidv4()}`,
        text: {
          type: 'plain_text',
          text: x.title
        },
        value: x.value
      }))
    })
  }
}
