import { TextRenderer } from '../../base/renderers/text'
import { TextContent } from '../../content/types'
import { TeamsContext } from '../context'

export class TeamsTextRenderer extends TextRenderer {
  renderText(context: TeamsContext, payload: TextContent) {
    context.messages.push({ text: payload.text })
  }
}
