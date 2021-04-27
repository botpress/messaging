import { ChannelRenderer } from '../../base/renderer'
import { TwilioContext } from '../context'

export class TwilioImageRenderer implements ChannelRenderer<TwilioContext> {
  get channel(): string {
    return 'twilio'
  }

  get priority(): number {
    return 0
  }

  get id() {
    return TwilioImageRenderer.name
  }

  handles(context: TwilioContext): boolean {
    return context.payload.image
  }

  render(context: TwilioContext) {
    const payload = context.payload // as sdk.ImageContent

    // TODO fix mediaUrl not being in typings
    context.messages.push(<any>{ body: payload.title as string, mediaUrl: payload.image })
  }
}
