import path from 'path'
import { AudioRenderer } from '../../base/renderers/audio'
import { AudioContent } from '../../content/types'
import { TelegramContext } from '../context'

export class TelegramAudioRenderer extends AudioRenderer {
  renderAudio(context: TelegramContext, payload: AudioContent) {
    context.messages.push({
      document: { url: payload.audio, filename: path.basename(payload.audio) },
      extra: { caption: payload.title }
    })
  }
}
