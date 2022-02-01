import { TextRenderer } from '../../base/renderers/text'
import { TextContent } from '../../content/types'
import { SmoochContext } from '../context'
const SunshineConversationsClient = require('sunshine-conversations-client')

export class SmoochTextRenderer extends TextRenderer {
  renderText(context: SmoochContext, payload: TextContent): void {
    const data = new SunshineConversationsClient.MessagePost()
    data.author = {
      type: 'business'
    }
    data.content = {
      type: 'text',
      text: payload.text
    }

    context.messages.push(data)
  }
}
