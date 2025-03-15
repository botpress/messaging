import { LocationRenderer } from '../../base/renderers/location'
import { LocationContent } from '../../content/types'
import { WhatsappContext } from '../context'

export class WhatsappLocationRenderer extends LocationRenderer {
  renderLocation(context: WhatsappContext, payload: LocationContent) {
    context.messages.push({
      type: 'location',
      location: {
        longitude: payload.longitude,
        latitude: payload.latitude,
        name: payload.title,
        address: payload.address
      }
    })
  }
}
