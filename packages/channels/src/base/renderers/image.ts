import { ChannelRenderer } from '../../base/renderer'
import { ImageContent } from '../../content/types'
import { ChannelContext } from '../context'

export abstract class ImageRenderer implements ChannelRenderer<any> {
  get priority(): number {
    return 0
  }

  handles(context: ChannelContext<any>): boolean {
    const payload = context.payload as ImageContent
    return !!payload.image
  }

  render(context: ChannelContext<any>) {
    const payload = context.payload as ImageContent
    this.renderImage(context, payload)
  }

  abstract renderImage(context: ChannelContext<any>, payload: ImageContent): void
}
