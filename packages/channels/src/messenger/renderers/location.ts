import { LocationRenderer } from '../../base/renderers/location'
import { LocationContent } from '../../content/types'
import { MessengerContext } from '../context'

export class MessengerLocationRenderer extends LocationRenderer {
  renderLocation(context: MessengerContext, payload: LocationContent) {
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${payload.latitude},${payload.longitude}`

    context.messages.push({
      text: `${payload.title}${payload.address ? `\n${payload.address}` : ''}\n${googleMapsLink}`
    })
  }
}
