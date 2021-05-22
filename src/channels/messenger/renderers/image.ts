import { ImageContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { formatUrl } from '../../url'
import { MessengerContext } from '../context'

export class MessengerImageRenderer implements ChannelRenderer<MessengerContext> {
  get priority(): number {
    return 0
  }

  handles(context: MessengerContext): boolean {
    return !!context.payload.image
  }

  render(context: MessengerContext) {
    const payload = context.payload as ImageContent

    // TODO: image caption

    context.messages.push({
      attachment: {
        type: 'image',
        payload: {
          is_reusable: true,
          url: formatUrl(context.botUrl, payload.image)
        }
      }
    })
  }
}
