import { AudioContent } from '@botpress/messaging-content'
import { AudioRenderer } from '../../base/renderers/audio'
import { TwilioContext } from '../context'

export class TwilioAudioRenderer extends AudioRenderer {
  renderAudio(context: TwilioContext, payload: AudioContent) {
    context.messages.push({ body: payload.title, mediaUrl: payload.audio })
  }
}
