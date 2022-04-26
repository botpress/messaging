import path from 'path'
import { VideoRenderer } from '../../base/renderers/video'
import { VideoContent } from '../../content/types'
import { TelegramContext } from '../context'

export class TelegramVideoRenderer extends VideoRenderer {
  renderVideo(context: TelegramContext, payload: VideoContent) {
    context.messages.push({
      document: { url: payload.video, filename: path.basename(payload.video) },
      extra: { caption: payload.title }
    })
  }
}
