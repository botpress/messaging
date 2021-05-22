import { ImageContent } from '../../../content/types'
import { ImageRenderer } from '../../base/renderers/image'
import { MessengerContext } from '../context'

export class MessengerImageRenderer extends ImageRenderer {
  renderImage(context: MessengerContext, payload: ImageContent): void {
    // TODO: image caption
    context.messages.push({
      attachment: {
        type: 'image',
        payload: {
          is_reusable: true,
          url: payload.image
        }
      }
    })
  }
}
