import { IndexChoiceOption, IndexChoiceType } from '../../base/context'
import { CarouselContext, CarouselRenderer } from '../../base/renderers/carousel'
import { ActionOpenURL, ActionPostback, ActionSaySomething, CardContent } from '../../content/types'
import { VonageContext } from '../context'

type Context = CarouselContext<VonageContext> & {
  options: IndexChoiceOption[]
}

export class VonageCarouselRenderer extends CarouselRenderer {
  startRenderCard(context: Context, card: CardContent) {
    context.options = []
  }

  renderButtonUrl(context: Context, button: ActionOpenURL) {
    context.options.push({
      type: IndexChoiceType.OpenUrl,
      title: `${button.title} : ${button.url}`,
      value: undefined!
    })
  }

  renderButtonPostback(context: Context, button: ActionPostback) {
    context.options.push({ type: IndexChoiceType.PostBack, title: button.title, value: button.payload })
  }

  renderButtonSay(context: Context, button: ActionSaySomething) {
    context.options.push({
      type: IndexChoiceType.SaySomething,
      title: button.title,
      value: button.text
    })
  }

  endRenderCard(context: Context, card: CardContent) {
    let body = card.title
    body += card.subtitle ? `\n\n${card.subtitle}` : ''
    body += `\n\n${context.options.map(({ title }, idx) => `*(${idx + 1})* ${title}`).join('\n')}`

    if (card.image) {
      context.channel.messages.push({
        content: {
          type: 'image',
          text: undefined!,
          image: {
            url: card.image,
            caption: body
          }
        }
      })
    } else {
      context.channel.messages.push({
        content: {
          type: 'text',
          text: body
        }
      })

      if (context.channel.identity && context.channel.sender) {
        context.channel.prepareIndexResponse(context.channel.identity, context.channel.sender, context.options)
      }
    }
  }
}
