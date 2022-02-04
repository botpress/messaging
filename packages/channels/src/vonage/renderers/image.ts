import { ImageRenderer } from '../../base/renderers/image'
import { ImageContent } from '../../content/types'
import { VonageContext } from '../context'

export class VonageImageRenderer extends ImageRenderer {
  renderImage(context: VonageContext, payload: ImageContent) {
    context.messages.push({
      message_type: 'image',
      image: {
        url: payload.image,
        caption: payload.title
      }
    })
  }
}
