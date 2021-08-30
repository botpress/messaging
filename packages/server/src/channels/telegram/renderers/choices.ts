import { Markup } from 'telegraf'
import { ChoiceContent } from '../../../content/types'
import { ChoicesRenderer } from '../../base/renderers/choices'
import { TelegramContext, TelegramMessage } from '../context'

export class TelegramChoicesRenderer extends ChoicesRenderer {
  renderChoice(context: TelegramContext, payload: ChoiceContent) {
    if (!context.messages.length) {
      context.messages.push({ text: '' })
    }

    const buttons = payload.choices.map((x) => Markup.button.callback(x.title, x.value))
    const keyboard = Markup.keyboard(buttons).reply_markup
    const message: Partial<TelegramMessage> = {
      extra: new Markup.Markup({ ...keyboard, one_time_keyboard: true })
    }

    context.messages[0] = { ...context.messages[0], ...message }
  }
}
