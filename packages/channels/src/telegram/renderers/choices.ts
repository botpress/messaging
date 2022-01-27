import { Markup } from 'telegraf'
import { ChoicesRenderer } from '../../base/renderers/choices'
import { ChoiceContent } from '../../content/types'
import { TelegramContext } from '../context'

export class TelegramChoicesRenderer extends ChoicesRenderer {
  renderChoice(context: TelegramContext, payload: ChoiceContent) {
    if (!context.messages.length) {
      context.messages.push({})
    }

    const buttons = payload.choices.map((x) => Markup.button.callback(x.title, x.value))
    context.messages[0].extra = Markup.keyboard(buttons).oneTime()
  }
}
