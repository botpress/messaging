import disbut from 'discord-buttons'
import { ChoiceContent } from '../../../content/types'
import { ChoicesRenderer } from '../../base/renderers/choices'
import { DiscordContext } from '../context'

export class DiscordChoicesRenderer extends ChoicesRenderer {
  async renderChoice(context: DiscordContext, payload: ChoiceContent): Promise<void> {
    const message = context.messages[0]

    if (!message.options) {
      message.options = {}
    }

    ;(<any>message.options).buttons = payload.choices.map((x) =>
      new disbut.MessageButton().setStyle('blurple').setLabel(x.title).setID(x.value)
    )
  }
}
