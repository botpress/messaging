import { TextRenderer } from '../../base/renderers/text'
import { TextContent } from '../../content/types'
import { SlackContext } from '../context'

export class SlackTextRenderer extends TextRenderer {
  renderText(context: SlackContext, payload: TextContent) {
    context.message.blocks.push({
      type: 'section',
      text: { type: payload.markdown ? 'mrkdwn' : 'plain_text', text: payload.text }
    })

    context.message.text = payload.text
  }
}
