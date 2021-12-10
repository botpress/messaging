import { ChannelRenderer } from '../../base/renderer'
import { AudioContent } from '../../content/types'
import { VonageContext } from '../context'

export class VonageAudioRenderer implements ChannelRenderer<VonageContext> {
  get priority(): number {
    return 0
  }

  handles(context: VonageContext): boolean {
    return !!context.payload.audio
  }

  async render(context: VonageContext) {
    const payload = context.payload as AudioContent

    context.messages.push({
      content: {
        type: 'audio',
        text: undefined!,
        audio: {
          url: payload.audio
        }
      }
    })
  }
}
