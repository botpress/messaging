import { LocationRenderer } from '../../base/renderers/location'
import { LocationContent } from '../../content/types'
import { TelegramContext } from '../context'

export class TelegramLocationRenderer extends LocationRenderer {
  renderLocation(context: TelegramContext, payload: LocationContent) {
    context.messages.push({
      location: { latitude: payload.latitude, longitude: payload.longitude },
      // This extra seems to not work
      extra: { caption: payload.title }
    })

    let text = payload.title
    if (payload.address) {
      text = (text ? `*${text}*\n` : '') + payload.address
    }

    if (payload.title) {
      context.messages.push({ text, extra: { parse_mode: 'Markdown' } })
    }
  }
}
