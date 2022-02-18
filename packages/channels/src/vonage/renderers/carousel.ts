import { IndexChoiceOption, IndexChoiceType } from '../../base/context'
import { CarouselRenderer, CarouselContext } from '../../base/renderers/carousel'
import { ActionOpenURL, ActionPostback, ActionSaySomething, CardContent, CarouselContent } from '../../content/types'
import { VonageContext } from '../context'

type Context = CarouselContext<VonageContext> & {
  options: IndexChoiceOption[]
  allOptions: IndexChoiceOption[]
  index: number
}

export class VonageCarouselRenderer extends CarouselRenderer {
  startRender(context: Context, carousel: CarouselContent) {
    context.allOptions = []
  }

  startRenderCard(context: Context, card: CardContent) {
    context.options = []
  }

  renderButtonUrl(context: Context, button: ActionOpenURL) {
    context.options.push({
      type: IndexChoiceType.OpenUrl,
      title: `${button.title} : ${button.url}`
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
    const body = `*${card.title}*\n\n${card.subtitle ? `${card.subtitle}\n\n` : ''}${context.options
      .map(({ title }, idx) => `*(${idx + context.allOptions.length + 1})* ${title}`)
      .join('\n')}`

    if (card.image) {
      context.channel.messages.push({
        message_type: 'image',
        image: {
          url: card.image,
          caption: body
        }
      })
    } else {
      context.channel.messages.push({ message_type: 'text', text: body })
    }

    context.allOptions.push(...context.options)
  }

  endRender(context: Context, carousel: CarouselContent) {
    context.channel.prepareIndexResponse(
      context.channel.scope,
      context.channel.identity,
      context.channel.sender,
      context.allOptions
    )
  }
}
