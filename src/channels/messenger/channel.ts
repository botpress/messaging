import { Channel, EndpointContent } from '../base/channel'
import { ChannelContext } from '../base/context'
import { MessengerConfig } from './config'
import { MessengerContext } from './context'

export class MessengerChannel extends Channel<MessengerConfig, MessengerContext> {
  get id(): string {
    return 'messenger'
  }

  get enableParsers(): boolean {
    return true
  }

  protected async setupConnection() {
    this.router.get('/', async (req, res) => {
      const mode = req.query['hub.mode']
      const token = req.query['hub.verify_token']
      const challenge = req.query['hub.challenge']

      if (mode && token && mode === 'subscribe' && token === this.config.verifyToken) {
        this.logger.debug('Webhook Verified')
        res.send(challenge)
      } else {
        res.sendStatus(403)
      }
    })

    this.router.post('/', this._handleIncomingMessage.bind(this))

    this.printWebhook()
  }

  private async _handleIncomingMessage(req: any, res: any) {
    const body = req.body

    if (body.object !== 'page') {
      // TODO: Handle other cases here
    } else {
      res.send('EVENT_RECEIVED')
    }

    for (const entry of body.entry) {
      const pageId = entry.id
      const messages = entry.messaging

      for (const webhookEvent of messages) {
        if (!webhookEvent.sender) {
          continue
        }

        await this.receive(webhookEvent)

        /*
        debugMessages('incoming', webhookEvent)
        const senderId = webhookEvent.sender.id

        await bot.client.sendAction(senderId, 'mark_seen')

        if (webhookEvent.message) {
          await this._sendEvent(bot.botId, senderId, webhookEvent.message.text)
        } else if (webhookEvent.postback) {
          await this._sendEvent(bot.botId, senderId, webhookEvent.postback.payload.text)
        }
        */
      }
    }
  }

  protected setupRenderers() {
    return []
  }

  protected setupSenders() {
    return []
  }

  protected async map(payload: any): Promise<EndpointContent> {
    return {
      content: { type: 'text', text: payload.message.text },
      foreignAppId: payload.recipient.id,
      foreignUserId: payload.sender.id
    }
  }

  protected context(base: ChannelContext<any>): Promise<MessengerContext> {
    return <any>{}
  }
}
