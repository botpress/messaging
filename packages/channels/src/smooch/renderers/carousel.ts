import { CarouselContext, CarouselRenderer } from '../../base/renderers/carousel'
import { ActionOpenURL, ActionPostback, ActionSaySomething, CardContent, CarouselContent } from '../../content/types'
import { SmoochCard, SmoochAction, SmoochContext } from '../context'
import { POSTBACK_PREFIX, SAY_PREFIX } from '../stream'

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
      text: button.title,
      type: 'link',
      uri: button.url
    })
  }

  renderButtonPostback(context: Context, button: ActionPostback) {
    context.actions.push({
      text: button.title,
      type: 'postback',
      payload: `${POSTBACK_PREFIX}${button.payload}`
    })
  }

  renderButtonSay(context: Context, button: ActionSaySomething) {
    context.actions.push({
      text: button.title,
      type: 'postback',
      payload: `${SAY_PREFIX}${button.text}`
    })
  }

  endRenderCard(context: Context, card: CardContent) {
    const scard: SmoochCard = {
      title: card.title,
      description: card.subtitle!,
      actions: context.actions
    }

    // Smooch crashes if mediaUrl is defined but has no value
    if (card.image) {
      scard.mediaUrl = card.image
    }

    if (scard.actions.length === 0) {
      // Smooch crashes if this list is empty or undefined. However putting this dummy
      // card in seems to produce the expected result (that is seeing 0 actions)
      scard.actions.push({
        text: '',
        type: 'postback',
        payload: ''
      })
    }

    context.items.push(scard)
  }

  endRender(context: Context, carousel: CarouselContent) {
    context.channel.messages.push({ type: 'carousel', items: context.items })
  }
}
