import { ChannelRenderer } from '../../base/renderer'
import {
  ActionOpenURL,
  ActionPostback,
  ActionSaySomething,
  ButtonAction,
  CardContent,
  CarouselContent
} from '../../content/types'
import { ChannelContext } from '../context'

export interface CarouselContext<T extends ChannelContext<any>> {
  channel: T
}

export abstract class CarouselRenderer implements ChannelRenderer<any> {
  get priority(): number {
    return 0
  }

  handles(context: ChannelContext<any>): boolean {
    const payload = context.payload as CarouselContent
    return !!payload.items?.length
  }

  render(context: ChannelContext<any>) {
    const payload = context.payload as CarouselContent
    const ctx = { channel: context }

    this.startRender(ctx, payload)

    for (const card of payload.items) {
      this.startRenderCard(ctx, card)

      for (const button of card.actions || []) {
        if (button.action === ButtonAction.OpenUrl) {
          this.renderButtonUrl(ctx, button as ActionOpenURL)
        } else if (button.action === ButtonAction.Postback) {
          this.renderButtonPostback(ctx, button as ActionPostback)
        } else if (button.action === ButtonAction.SaySomething) {
          this.renderButtonSay(ctx, button as ActionSaySomething)
        }
      }

      this.endRenderCard(ctx, card)
    }

    this.endRender(ctx, payload)
  }

  startRender(context: CarouselContext<any>, carousel: CarouselContent) {}

  startRenderCard(context: CarouselContext<any>, card: CardContent) {}

  renderButtonUrl(context: CarouselContext<any>, button: ActionOpenURL) {}

  renderButtonPostback(context: CarouselContext<any>, button: ActionPostback) {}

  renderButtonSay(context: CarouselContext<any>, button: ActionSaySomething) {}

  endRenderCard(context: CarouselContext<any>, card: CardContent) {}

  endRender(context: CarouselContext<any>, carousel: CarouselContent) {}
}
