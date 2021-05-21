import { ImageContent } from '../../../content/types'
import { ImageRenderer } from '../../base/renderers/image'
import { SlackContext } from '../context'

export class SlackImageRenderer extends ImageRenderer {
  renderImage(context: SlackContext, image: ImageContent) {
    context?.message?.blocks?.push({
      type: 'image',
      title: {
        type: 'plain_text',
        text: image.title!
      },
      image_url: image.image,
      alt_text: 'image'
    })
  }
}
