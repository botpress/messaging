import { ImageRenderer } from '../../base/renderers/image'
import { ImageContent } from '../../content/types'
import { MessengerContext } from '../context'

export class MessengerImageRenderer extends ImageRenderer {
  renderImage(context: MessengerContext, payload: ImageContent): void {
    context.messages.push({
      attachment: {
        type: 'image',
        payload: {
          is_reusable: true,
          url: payload.image
        }
      }
    })

    if (payload.title?.length) {
      // TODO: could maybe use the media templat instead?
      context.messages.push({ text: payload.title })
    }
  }
}
