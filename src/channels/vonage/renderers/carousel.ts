import { ActionOpenURL, ActionPostback, ActionSaySomething, CardContent, ChoiceOption } from '../../../content/types'
import { CarouselContext, CarouselRenderer } from '../../base/renderers/carousel'
import { VonageContext } from '../context'

type Context = CarouselContext<VonageContext> & {
  options: ChoiceOption[]
}

export class VonageCarouselRenderer extends CarouselRenderer {
  startRenderCard(context: Context, card: CardContent) {
    context.options = []
  }

  renderButtonUrl(context: Context, button: ActionOpenURL) {
    context.options.push({
      title: `${button.title} : ${button.url}`,
      value: undefined!
    })
  }

  renderButtonPostback(context: Context, button: ActionPostback) {
    context.options.push({ title: button.title, value: button.payload })
  }

  renderButtonSay(context: Context, button: ActionSaySomething) {
    context.options.push({
      title: button.title,
      value: button.text
    })
  }

  endRenderCard(context: Context, card: CardContent) {
    const body = `${card.title}\n\n${card.subtitle}\n\n${context.options
      .map(({ title }, idx) => `*(${idx + 1})* ${title}`)
      .join('\n')}`

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
