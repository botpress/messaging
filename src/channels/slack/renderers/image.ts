import { ImageContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { formatUrl } from '../../url'
import { SlackContext } from '../context'

export class SlackImageRenderer implements ChannelRenderer<SlackContext> {
  get priority(): number {
    return 0
  }

  handles(context: SlackContext): boolean {
    return !!context.payload.image
  }

  render(context: SlackContext) {
    const payload = context.payload as ImageContent

    context?.message?.blocks?.push({
      type: 'image',
      title: {
        type: 'plain_text',
        text: payload.title as string
      },
      image_url: <any>formatUrl(context.botUrl, payload.image),
      alt_text: 'image'
    })
  }
}
