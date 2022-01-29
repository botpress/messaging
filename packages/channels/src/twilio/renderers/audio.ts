import { AudioRenderer } from '../../base/renderers/audio'
import { AudioContent } from '../../content/types'
import { TwilioContext } from '../context'

export class TwilioAudioRenderer extends AudioRenderer {
  renderAudio(context: TwilioContext, payload: AudioContent) {
    context.messages.push({ body: payload.title, mediaUrl: payload.audio })
  }
}
