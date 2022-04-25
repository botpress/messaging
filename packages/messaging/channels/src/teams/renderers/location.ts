import { LocationRenderer } from '../../base/renderers/location'
import { LocationContent } from '../../content/types'
import { TeamsContext } from '../context'

export class TeamsLocationRenderer extends LocationRenderer {
  renderLocation(context: TeamsContext, payload: LocationContent) {
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${payload.latitude},${payload.longitude}`

    context.messages.push({
      text: `${payload.title}${payload.address ? ` ${payload.address}` : ' '} ${googleMapsLink}`
    })
  }
}
