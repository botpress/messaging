import { LocationContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { VonageContext } from '../context'

export class VonageLocationRenderer implements ChannelRenderer<VonageContext> {
  get priority(): number {
    return 0
  }

  handles(context: VonageContext): boolean {
    return context.payload.latitude && context.payload.longitude
  }

  async render(context: VonageContext) {
    const payload = context.payload as LocationContent

    context.messages.push({
      // custom content doesn't have typings
      content: <any>{
        type: 'custom',
        text: undefined,
        custom: {
          type: 'location',
          location: {
            latitude: payload.latitude,
            longitude: payload.longitude,
            name: payload.title,
            address: payload.address
          }
        }
      }
    })
  }
}
