import { LocationRenderer } from '../../base/renderers/location'
import { LocationContent } from '../../content/types'
import { SlackContext } from '../context'

export class SlackLocationRenderer extends LocationRenderer {
  renderLocation(context: SlackContext, payload: LocationContent) {
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${payload.latitude},${payload.longitude}`

    context.message.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${payload.title ? `${payload.title}\n` : ''}<${googleMapsLink}|${payload.address || googleMapsLink}>`
      }
    })

    context.message.text = payload.title || payload.address || googleMapsLink
  }
}
