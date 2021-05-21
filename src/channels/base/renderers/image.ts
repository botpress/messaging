import { ImageContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { formatUrl } from '../../url'
import { ChannelContext } from '../context'

export abstract class ImageRenderer implements ChannelRenderer<any> {
  get priority(): number {
    return 0
  }

  handles(context: ChannelContext<any>): boolean {
    return !!context.payload.image
  }

  render(context: ChannelContext<any>) {
    const payload = context.payload as ImageContent

    payload.image = formatUrl(context.botUrl, payload.image)!

    this.renderImage(context, payload)
  }

  abstract renderImage(context: ChannelContext<any>, image: ImageContent): void
}
