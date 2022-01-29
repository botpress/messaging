import { IndexChoiceOption, IndexChoiceType } from '../../base/context'
import { CarouselRenderer, CarouselContext } from '../../base/renderers/carousel'
import { ActionOpenURL, ActionPostback, ActionSaySomething, CardContent, CarouselContent } from '../../content/types'
import { TwilioContext } from '../context'

type Context = CarouselContext<TwilioContext> & {
  options: IndexChoiceOption[]
  allOptions: IndexChoiceOption[]
  index: number
}

export class TwilioCarouselRenderer extends CarouselRenderer {
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
    const body = `${card.title}\n\n${card.subtitle || ''}\n\n${context.options
      .map(({ title }, idx) => `${idx + context.allOptions.length + 1}. ${title}`)
      .join('\n')}`

    context.channel.messages.push(<any>{ body, mediaUrl: card.image })
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
