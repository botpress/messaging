import { VideoContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { formatUrl } from '../../url'
import { VonageContext } from '../context'

export class VonageVideoRenderer implements ChannelRenderer<VonageContext> {
  get priority(): number {
    return 0
  }

  handles(context: VonageContext): boolean {
    return !!context.payload.video
  }

  async render(context: VonageContext) {
    const payload = context.payload as VideoContent

    context.messages.push({
      content: {
        type: 'video',
        text: undefined!,
        video: {
          url: formatUrl(context.botUrl, payload.video)!
        }
      }
    })
  }
}
