import { AudioRenderer } from '../../base/renderers/audio'
import { AudioContent } from '../../content/types'
import { SmoochContext } from '../context'

export class SmoochAudioRenderer extends AudioRenderer {
  renderAudio(context: SmoochContext, payload: AudioContent) {
    context.messages.push({ type: 'file', text: payload.title, mediaUrl: payload.audio })
  }
}
