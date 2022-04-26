import { ChannelRenderer } from '../../base/renderer'
import { LocationContent } from '../../content/types'
import { ChannelContext } from '../context'

export abstract class LocationRenderer implements ChannelRenderer<any> {
  get priority(): number {
    return 0
  }

  handles(context: ChannelContext<any>): boolean {
    const payload = context.payload as LocationContent
    return !!payload.latitude && !!payload.longitude
  }

  render(context: ChannelContext<any>) {
    const payload = context.payload as LocationContent
    this.renderLocation(context, payload)
  }

  abstract renderLocation(context: ChannelContext<any>, payload: LocationContent): void
}
