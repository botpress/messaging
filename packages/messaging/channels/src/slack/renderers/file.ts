import { FileContent } from '@botpress/messaging-content'
import { FileRenderer } from '../../base/renderers/file'
import { SlackContext } from '../context'

export class SlackFileRenderer extends FileRenderer {
  renderFile(context: SlackContext, payload: FileContent) {
    context.message.blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `<${payload.file}|${payload.title || payload.file}>` }
    })

    context.message.text = payload.title || payload.file
  }
}
