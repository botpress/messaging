import { ImageContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { formatUrl } from '../../url'
import { TwilioContext } from '../context'

export class TwilioImageRenderer implements ChannelRenderer<TwilioContext> {
  get priority(): number {
    return 0
  }

  handles(context: TwilioContext): boolean {
    return !!context.payload.image
  }

  render(context: TwilioContext) {
    const payload = context.payload as ImageContent

    // TODO fix mediaUrl not being in typings
    context.messages.push(<any>{ body: payload.title as string, mediaUrl: formatUrl(context.botUrl, payload.image) })
  }
}
