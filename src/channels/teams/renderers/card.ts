import { CardContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { TeamsContext } from '../context'

export class TeamsCardRenderer implements ChannelRenderer<TeamsContext> {
  get priority(): number {
    return -1
  }

  get id(): string {
    return TeamsCardRenderer.name
  }

  handles(context: TeamsContext): boolean {
    return context.payload.type === 'card'
  }

  render(context: TeamsContext) {
    const payload = context.payload as CardContent

    // we convert our card to a carousel
    context.payload = context.payload = {
      type: 'carousel',
      items: [payload]
    }
  }
}
