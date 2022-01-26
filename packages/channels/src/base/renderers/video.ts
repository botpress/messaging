import { VideoContent } from '../../content/types'
import { ChannelContext } from '../context'
import { ChannelRenderer } from '../renderer'

export abstract class VideoRenderer implements ChannelRenderer<any> {
  get priority(): number {
    return 0
  }

  handles(context: ChannelContext<any>): boolean {
    const payload = context.payload as VideoContent
    return !!payload.video
  }

  render(context: ChannelContext<any>) {
    const payload = context.payload as VideoContent
    this.renderVideo(context, payload)
  }

  abstract renderVideo(context: ChannelContext<any>, payload: VideoContent): void
}
