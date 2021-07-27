import { ActionOpenURL, ActionPostback, ActionSaySomething, CardContent, CarouselContent } from '../../../content/types'
import { CarouselContext, CarouselRenderer } from '../../base/renderers/carousel'
import { MessengerContext } from '../context'

type Context = CarouselContext<MessengerContext> & {
  cards: any[]
  buttons: any[]
}

export class MessengerCarouselRenderer extends CarouselRenderer {
  startRender(context: Context, carousel: CarouselContent) {
    context.cards = []
  }

  startRenderCard(context: Context, card: CardContent) {
    context.buttons = []
  }

  renderButtonUrl(context: Context, button: ActionOpenURL) {
    context.buttons.push({
      type: 'web_url',
      url: button.url,
      title: button.title
    })
  }

  renderButtonPostback(context: Context, button: ActionPostback) {
    context.buttons.push({
      type: 'postback',
      title: button.title,
      payload: `postback::${button.payload}`
    })
  }

  renderButtonSay(context: Context, button: ActionSaySomething) {
    context.buttons.push({
      type: 'postback',
      title: button.title,
      payload: `say::${button.text}`
    })
  }

  endRenderCard(context: Context, card: CardContent) {
    context.cards.push({
      title: card.title,
      image_url: card.image ? card.image : null,
      subtitle: card.subtitle,
      buttons: context.buttons
    })
  }

  endRender(context: Context, carousel: CarouselContent) {
    context.channel.messages.push({
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: context.cards
        }
      }
    })
  }
}
