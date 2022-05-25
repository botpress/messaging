import { AudioContent } from '@botpress/messaging-content'
import { AudioRenderer } from '../../base/renderers/audio'
import { SlackContext } from '../context'

export class SlackAudioRenderer extends AudioRenderer {
  renderAudio(context: SlackContext, payload: AudioContent) {
    context.message.blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `<${payload.audio}|${payload.title || payload.audio}>` }
    })

    context.message.text = payload.title || payload.audio
  }
}
