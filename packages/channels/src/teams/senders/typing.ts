import { TypingSender } from '../../base/senders/typing'
import { TeamsContext } from '../context'

export class TeamsTypingSender extends TypingSender {
  async sendIndicator(context: TeamsContext) {}
}
