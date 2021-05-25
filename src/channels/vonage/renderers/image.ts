import { ImageContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { formatUrl } from '../../url'
import { VonageContext } from '../context'

export class VonageImageRenderer implements ChannelRenderer<VonageContext> {
  get priority(): number {
    return 0
  }

  handles(context: VonageContext): boolean {
    return !!context.payload.image
  }

  async render(context: VonageContext) {
    const payload = context.payload as ImageContent

    context.messages.push({
      content: {
        type: 'image',
        text: undefined!,
        image: {
          url: formatUrl(context.botUrl, payload.image)!,
          caption: payload.title as string
        }
      }
    })
  }
}
