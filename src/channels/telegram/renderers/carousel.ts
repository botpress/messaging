import path from 'path'
import { Extra, Markup } from 'telegraf'
import { InlineKeyboardButton } from 'telegraf/typings/markup'
import { ActionOpenURL, ActionPostback, ActionSaySomething, CardContent } from '../../../content/types'
import { CarouselContext, CarouselRenderer } from '../../base/renderers/carousel'
import { TelegramContext } from '../context'

type Context = CarouselContext<TelegramContext> & {
  buttons: InlineKeyboardButton[]
}

export class TelegramCarouselRenderer extends CarouselRenderer {
  startRenderCard(context: Context, _card: CardContent) {
    context.buttons = []
  }

  renderButtonUrl(context: Context, button: ActionOpenURL) {
    context.buttons.push(Markup.urlButton(button.title, button.url))
  }

  renderButtonPostback(context: Context, button: ActionPostback) {
    context.buttons.push(Markup.callbackButton(button.title, button.payload))
  }

  renderButtonSay(context: Context, button: ActionSaySomething) {
    context.buttons.push(Markup.callbackButton(button.title, button.text))
  }

  endRenderCard(context: Context, card: CardContent) {
    if (card.image) {
      context.channel.messages.push({ action: 'upload_photo' })
      context.channel.messages.push({
        photo: {
          url: card.image,
          filename: path.basename(card.image)
        },
        extra: new Extra({ caption: `*${card.title}*${card.subtitle ? '\n' + card.subtitle : ''}` })
          .markdown(true)
          .markup(Markup.inlineKeyboard(context.buttons))
      })
    }
  }
}
