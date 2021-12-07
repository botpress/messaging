import path from 'path'
import { Extra, Markup } from 'telegraf'
import { InlineKeyboardButton } from 'telegraf/typings/markup'
import { CarouselContext, CarouselRenderer } from '../../base/renderers/carousel'
import { ActionOpenURL, ActionPostback, ActionSaySomething, CardContent } from '../../content/types'
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
    context.buttons.push(Markup.callbackButton(button.title, `postback::${button.payload}`))
  }

  renderButtonSay(context: Context, button: ActionSaySomething) {
    context.buttons.push(Markup.callbackButton(button.title, `say::${button.text}`))
  }

  endRenderCard(context: Context, card: CardContent) {
    const text = `*${card.title}*${card.subtitle ? '\n' + card.subtitle : ''}`

    if (card.image) {
      context.channel.messages.push({ action: 'upload_photo' })
      context.channel.messages.push({
        photo: {
          url: card.image,
          filename: path.basename(card.image)
        },
        extra: new Extra({ caption: text }).markdown(true).markup(Markup.inlineKeyboard(context.buttons))
      })
    } else {
      context.channel.messages.push({
        text,
        extra: Extra.markdown(true).markup(Markup.inlineKeyboard(context.buttons))
      })
    }
  }
}
