import { TextRenderer } from '../../base/renderers/text'
import { TextContent } from '../../content/types'
import { TelegramContext } from '../context'

export class TelegramTextRenderer extends TextRenderer {
  renderText(context: TelegramContext, payload: TextContent) {
    context.messages.push({
      text: payload.text,
      markdown: payload.markdown,
      extra: payload.markdown ? { parse_mode: 'Markdown' } : {}
    })
  }
}
