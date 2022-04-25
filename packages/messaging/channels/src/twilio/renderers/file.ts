import { FileRenderer } from '../../base/renderers/file'
import { FileContent } from '../../content/types'
import { TwilioContext } from '../context'

export class TwilioFileRenderer extends FileRenderer {
  renderFile(context: TwilioContext, payload: FileContent) {
    context.messages.push({ body: `${payload.title ? `${payload.title}\n` : payload.title}${payload.file}` })
  }
}
