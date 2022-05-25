import { FileContent } from '@botpress/messaging-content'
import { FileRenderer } from '../../base/renderers/file'
import { TeamsContext } from '../context'

export class TeamsFileRenderer extends FileRenderer {
  renderFile(context: TeamsContext, payload: FileContent) {
    context.messages.push({
      text: `${payload.title ? `${payload.title} ` : ''}${payload.file}`
    })
  }
}
