import { FileContent } from '@botpress/messaging-content'
import { FileRenderer } from '../../base/renderers/file'
import { TwilioContext } from '../context'

export class TwilioFileRenderer extends FileRenderer {
  renderFile(context: TwilioContext, payload: FileContent) {
    context.messages.push({ body: `${payload.title ? `${payload.title}\n` : payload.title}${payload.file}` })
  }
}
