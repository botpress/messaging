import { ImageContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { formatUrl } from '../../url'
import { SmoochContext } from '../context'

export class SmoochImageRenderer implements ChannelRenderer<SmoochContext> {
  get priority(): number {
    return 0
  }

  get id(): string {
    return SmoochImageRenderer.name
  }

  handles(context: SmoochContext): boolean {
    return !!context.payload.image
  }

  async render(context: SmoochContext) {
    const payload = context.payload as ImageContent

    context.messages.push({ type: 'image', mediaUrl: formatUrl(context.botUrl, payload.image) })
  }
}
