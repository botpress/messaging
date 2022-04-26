import { ChannelRenderer } from '../../base/renderer'
import { AudioContent } from '../../content/types'
import { ChannelContext } from '../context'

export abstract class AudioRenderer implements ChannelRenderer<any> {
  get priority(): number {
    return 0
  }

  handles(context: ChannelContext<any>): boolean {
    const payload = context.payload as AudioContent
    return !!payload.audio
  }

  render(context: ChannelContext<any>) {
    const payload = context.payload as AudioContent
    this.renderAudio(context, payload)
  }

  abstract renderAudio(context: ChannelContext<any>, payload: AudioContent): void
}
