import { ImageContent } from '../../../content/types'
import { ImageRenderer } from '../../base/renderers/image'
import { TelegramContext } from '../context'

export class TelegramImageRenderer extends ImageRenderer {
  renderImage(context: TelegramContext, image: ImageContent) {
    if (image.image.toLowerCase().endsWith('.gif')) {
      context.messages.push({ animation: image.image })
    } else {
      context.messages.push({ photo: image.image })
    }
  }
}
