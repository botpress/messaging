import { TextContent } from '../../../content/types'
import { TextRenderer } from '../../base/renderers/text'
import { SlackContext } from '../context'

export class SlackTextRenderer extends TextRenderer {
  renderText(context: SlackContext, payload: TextContent) {
    context.message.text = payload.text
  }
}
