import { TextRenderer } from '../../base/renderers/text'
import { TextContent } from '../../content/types'
import { SlackContext } from '../context'

export class SlackTextRenderer extends TextRenderer {
  renderText(context: SlackContext, payload: TextContent) {}
}
