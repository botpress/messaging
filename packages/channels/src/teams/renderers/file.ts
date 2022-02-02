import { ActivityTypes } from 'botbuilder'
import { FileRenderer } from '../../base/renderers/file'
import { FileContent } from '../../content/types'
import { TeamsContext } from '../context'

export class TeamsFileRenderer extends FileRenderer {
  renderFile(context: TeamsContext, payload: FileContent) {
    context.messages.push({
      type: ActivityTypes.Message,
      text: `${payload.title ? `${payload.title} ` : ''}${payload.file}`
    })
  }
}
