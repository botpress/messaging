import { CarouselContext, CarouselRenderer } from '../../base/renderers/carousel'
import { ActionOpenURL, ActionPostback, ActionSaySomething, CardContent, CarouselContent } from '../../content/types'
import { MessengerContext } from '../context'
import { MessengerButton, MessengerCard } from '../messenger'

export const POSTBACK_PREFIX = 'postback::'
export const SAY_PREFIX = 'say::'

type Context = CarouselContext<MessengerContext> & {
  cards: MessengerCard[]
  buttons: MessengerButton[]
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
      payload: `${POSTBACK_PREFIX}${button.payload}`
    })
  }

  renderButtonSay(context: Context, button: ActionSaySomething) {
    context.buttons.push({
      type: 'postback',
      title: button.title,
      payload: `${SAY_PREFIX}${button.text}`
    })
  }

  endRenderCard(context: Context, card: CardContent) {
    if (context.buttons.length === 0) {
      context.buttons.push({
        type: 'postback',
        title: card.title,
        payload: card.title
      })
    }

    context.cards.push({
      title: card.title,
      image_url: card.image ? card.image : undefined,
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
