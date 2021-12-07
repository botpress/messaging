import { ChannelRenderer } from '../../base/renderer'
import { TextContent } from '../../content/types'
import { ChannelContext } from '../context'

export abstract class TextRenderer implements ChannelRenderer<any> {
  get priority(): number {
    return 0
  }

  handles(context: ChannelContext<any>): boolean {
    const payload = context.payload as TextContent
    return !!payload.text
  }

  render(context: ChannelContext<any>) {
    const payload = context.payload as TextContent
    this.renderText(context, payload)
  }

  abstract renderText(context: ChannelContext<any>, payload: TextContent): void
}
