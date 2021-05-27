import { ImageContent } from '../../../content/types'
import { ImageRenderer } from '../../base/renderers/image'
import { DiscordContext } from '../context'

export class DiscordImageRenderer extends ImageRenderer {
  renderImage(context: DiscordContext, payload: ImageContent): void {
    context.messages.push({ content: payload.title, options: { files: [payload.image] } })
  }
}
