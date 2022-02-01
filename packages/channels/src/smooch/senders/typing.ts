import { TypingSender } from '../../base/senders/typing'
import { SmoochContext } from '../context'

export class SmoochTypingSender extends TypingSender {
  async sendIndicator(context: SmoochContext) {}
}
