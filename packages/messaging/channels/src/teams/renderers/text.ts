import { TextContent } from '@botpress/messaging-content'
import { TextRenderer } from '../../base/renderers/text'
import { TeamsContext } from '../context'

export class TeamsTextRenderer extends TextRenderer {
  renderText(context: TeamsContext, payload: TextContent) {
    context.messages.push({ text: payload.text })
  }
}
