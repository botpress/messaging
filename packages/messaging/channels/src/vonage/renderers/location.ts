import { LocationRenderer } from '../../base/renderers/location'
import { LocationContent } from '../../content/types'
import { VonageContext } from '../context'

export class VonageLocationRenderer extends LocationRenderer {
  renderLocation(context: VonageContext, payload: LocationContent) {
    context.messages.push({
      message_type: 'custom',
      custom: {
        type: 'location',
        location: {
          latitude: payload.latitude,
          longitude: payload.longitude,
          name: payload.title,
          address: payload.address
        }
      }
    })
  }
}
