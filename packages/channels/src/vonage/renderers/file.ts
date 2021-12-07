import { ChannelRenderer } from '../../base/renderer'
import { FileContent } from '../../content/types'
import { VonageContext } from '../context'

export class VonageFileRenderer implements ChannelRenderer<VonageContext> {
  get priority(): number {
    return 0
  }

  handles(context: VonageContext): boolean {
    return context.payload.file
  }

  async render(context: VonageContext) {
    const payload = context.payload as FileContent

    context.messages.push({
      content: {
        type: 'file',
        text: undefined!,
        file: {
          url: payload.file!,
          caption: payload.title!
        }
      }
    })
  }
}
