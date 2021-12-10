import { Extra, Markup } from 'telegraf'
import { ChoicesRenderer } from '../../base/renderers/choices'
import { ChoiceContent } from '../../content/types'
import { TelegramContext } from '../context'

export class TelegramChoicesRenderer extends ChoicesRenderer {
  renderChoice(context: TelegramContext, payload: ChoiceContent) {
    if (!context.messages.length) {
      context.messages.push({})
    }

    const buttons = payload.choices.map((x) => Markup.callbackButton(x.title, x.value))
    const keyboard = Markup.keyboard(buttons)

    context.messages[0].extra = Extra.markdown(false).markup({ ...keyboard, one_time_keyboard: true })
  }
}
