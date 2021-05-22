import { ActionOpenURL, ActionPostback, ButtonAction, CarouselContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { formatUrl } from '../../url'
import { MessengerContext } from '../context'

export class MessengerCarouselRenderer implements ChannelRenderer<MessengerContext> {
  get priority(): number {
    return 0
  }

  handles(context: MessengerContext): boolean {
    return !!context.payload.items?.length
  }

  render(context: MessengerContext) {
    const payload = context.payload as CarouselContent
    const cards = []

    for (const card of payload.items) {
      const buttons = []

      for (const action of card.actions || []) {
        if (action.action === ButtonAction.OpenUrl) {
          buttons.push({
            type: 'web_url',
            url: (action as ActionOpenURL).url.replace('BOT_URL', context.botUrl),
            title: action.title
          })
        } else if (action.action === ButtonAction.Postback) {
          buttons.push({
            type: 'postback',
            title: action.title,
            payload: (action as ActionPostback).payload
          })
        } else if (action.action === ButtonAction.SaySomething) {
          // TODO: not supported yet
        }
      }

      cards.push({
        title: card.title,
        image_url: card.image ? formatUrl(context.botUrl, card.image) : null,
        subtitle: card.subtitle,
        buttons
      })
    }

    context.messages.push({
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: cards
        }
      }
    })
  }
}
