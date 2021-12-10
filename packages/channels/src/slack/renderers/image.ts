import { ImageRenderer } from '../../base/renderers/image'
import { ImageContent } from '../../content/types'
import { SlackContext } from '../context'

export class SlackImageRenderer extends ImageRenderer {
  renderImage(context: SlackContext, payload: ImageContent) {
    context?.message?.blocks?.push({
      type: 'image',
      title: {
        type: 'plain_text',
        text: payload.title ?? 'image_title'
      },
      image_url: payload.image,
      alt_text: 'image'
    })
  }
}
