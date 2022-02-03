import { FileRenderer } from '../../base/renderers/file'
import { FileContent } from '../../content/types'
import { TeamsContext } from '../context'

export class TeamsFileRenderer extends FileRenderer {
  renderFile(context: TeamsContext, payload: FileContent) {
    context.messages.push({
      text: `${payload.title ? `${payload.title} ` : ''}${payload.file}`
    })
  }
}
