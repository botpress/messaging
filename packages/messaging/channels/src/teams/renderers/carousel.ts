import { Attachment, AttachmentLayoutTypes, CardAction, CardFactory } from 'botbuilder'
import { CarouselContext, CarouselRenderer } from '../../base/renderers/carousel'
import { ActionOpenURL, ActionPostback, ActionSaySomething, CardContent, CarouselContent } from '../../content/types'
import { TeamsContext } from '../context'

export const POSTBACK_PREFIX = 'postback::'
export const SAY_PREFIX = 'say::'

type Context = CarouselContext<TeamsContext> & {
  attachements: Attachment[]
  actions: CardAction[]
}

export class TeamsCarouselRenderer extends CarouselRenderer {
  startRender(context: Context, carousel: CarouselContent) {
    context.attachements = []
  }

  startRenderCard(context: Context, card: CardContent) {
    context.actions = []
  }

  renderButtonUrl(context: Context, button: ActionOpenURL) {
    context.actions.push({
      type: 'openUrl',
      value: button.url,
      title: button.title
    })
  }

  renderButtonPostback(context: Context, button: ActionPostback) {
    context.actions.push({
      type: 'messageBack',
      title: button.title,
      value: `${POSTBACK_PREFIX}${button.payload}`,
      text: `${POSTBACK_PREFIX}${button.payload}`
    })
  }

  renderButtonSay(context: Context, button: ActionSaySomething) {
    context.actions.push({
      type: 'messageBack',
      title: button.title,
      value: `${SAY_PREFIX}${button.text}`,
      text: `${SAY_PREFIX}${button.text}`
    })
  }

  endRenderCard(context: Context, card: CardContent) {
    context.attachements.push(
      CardFactory.heroCard(card.title, CardFactory.images([card.image!]), CardFactory.actions(context.actions), {
        subtitle: card.subtitle
      })
    )
  }

  endRender(context: Context, carousel: CarouselContent) {
    context.channel.messages.push({
      type: 'message',
      attachments: context.attachements,
      attachmentLayout: AttachmentLayoutTypes.Carousel
    })
  }
}
