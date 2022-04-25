import { CarouselContext, CarouselRenderer } from '../../base/renderers/carousel'
import { ActionOpenURL, ActionPostback, ActionSaySomething, CardContent, CarouselContent } from '../../content/types'
import { SmoochContext } from '../context'
import { SmoochAction, SmoochCard } from '../smooch'

export const POSTBACK_PREFIX = 'postback::'
export const SAY_PREFIX = 'say::'

type Context = CarouselContext<SmoochContext> & {
  items: SmoochCard[]
  actions: SmoochAction[]
}

export class SmoochCarouselRenderer extends CarouselRenderer {
  startRender(context: Context, carousel: CarouselContent) {
    context.items = []
  }

  startRenderCard(context: Context, card: CardContent) {
    context.actions = []
  }

  renderButtonUrl(context: Context, button: ActionOpenURL) {
    context.actions.push({
      type: 'link',
      text: button.title,
      uri: button.url
    })
  }

  renderButtonPostback(context: Context, button: ActionPostback) {
    context.actions.push({
      type: 'postback',
      text: button.title,
      payload: `${POSTBACK_PREFIX}${button.payload}`
    })
  }

  renderButtonSay(context: Context, button: ActionSaySomething) {
    context.actions.push({
      type: 'postback',
      text: button.title,
      payload: `${SAY_PREFIX}${button.text}`
    })
  }

  endRenderCard(context: Context, card: CardContent) {
    if (context.actions.length === 0) {
      context.actions.push({
        type: 'postback',
        text: card.title,
        payload: card.title
      })
    }

    const smoochCard: SmoochCard = {
      title: card.title,
      description: card.subtitle,
      mediaUrl: card.image,
      actions: context.actions
    }

    context.items.push(smoochCard)
  }

  endRender(context: Context, carousel: CarouselContent) {
    context.channel.messages.push({
      type: 'carousel',
      items: context.items
    })
  }
}
