import { ImageRenderer } from '../../base/renderers/image'
import { ImageContent } from '../../content/types'
import { VonageContext } from '../context'

export class VonageImageRenderer extends ImageRenderer {
  renderImage(context: VonageContext, payload: ImageContent) {
    context.messages.push({
      content: {
        type: 'image',
        text: undefined!,
        image: {
          url: payload.image,
          caption: payload.title!
        }
      }
    })
  }
}
