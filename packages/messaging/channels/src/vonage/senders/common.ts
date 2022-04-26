import axios from 'axios'
import { CommonSender } from '../../base/senders/common'
import { VonageContext } from '../context'

export class VonageCommonSender extends CommonSender {
  async send(context: VonageContext) {
    for (const message of context.messages) {
      const data = {
        ...message,
        to: context.sender,
        from: context.identity,
        channel: 'whatsapp'
      }

      const url = {
        sandbox: 'https://messages-sandbox.nexmo.com/v1/messages',
        production: 'https://api.nexmo.com/v1/messages'
      }

      await axios.post(context.state.config.useTestingApi ? url.sandbox : url.production, data, {
        auth: { username: context.state.config.apiKey, password: context.state.config.apiSecret }
      })

      if (context.state.config.useTestingApi) {
        // sandbox is limited to 1 msg / sec
        await new Promise((resolve) => setTimeout(resolve, 1100))
      }
    }
  }
}
