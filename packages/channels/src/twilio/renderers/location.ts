import { LocationRenderer } from '../../base/renderers/location'
import { LocationContent } from '../../content/types'
import { TwilioContext } from '../context'

export class TwilioLocationRenderer extends LocationRenderer {
  renderLocation(context: TwilioContext, payload: LocationContent) {
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${payload.latitude},${payload.longitude}`

    context.messages.push({
      body: `${payload.title}${payload.address ? `\n${payload.address}` : ''}\n${googleMapsLink}`
    })
  }
}
