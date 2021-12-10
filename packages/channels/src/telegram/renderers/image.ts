import { ImageRenderer } from '../../base/renderers/image'
import { ImageContent } from '../../content/types'
import { TelegramContext } from '../context'

export class TelegramImageRenderer extends ImageRenderer {
  renderImage(context: TelegramContext, payload: ImageContent) {
    if (payload.image.toLowerCase().endsWith('.gif')) {
      context.messages.push({ animation: payload.image })
    } else {
      context.messages.push({ photo: payload.image })
    }
  }
}
