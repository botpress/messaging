import { createEventAdapter } from '@slack/events-api'
import SlackEventAdapter from '@slack/events-api/dist/adapter'
import { createMessageAdapter, SlackMessageAdapter } from '@slack/interactive-messages'
import { WebClient } from '@slack/web-api'
import axios from 'axios'
import _ from 'lodash'
import { RequestListener } from 'node:http'
import { ConduitInstance, EndpointContent } from '../base/conduit'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { TypingSender } from '../base/senders/typing'
import { SlackConfig } from './config'
import { SlackContext } from './context'
import { SlackRenderers } from './renderers'
import { SlackSenders } from './senders'

export class SlackConduit extends ConduitInstance<SlackConfig, SlackContext> {
  public handleInteractiveRequest!: RequestListener
  public handleEventRequest!: RequestListener

  private client!: WebClient
  private interactive!: SlackMessageAdapter
  private events!: SlackEventAdapter

  protected async setupConnection() {
    this.client = new WebClient(this.config.botToken)
    this.events = createEventAdapter(this.config.signingSecret)
    this.interactive = createMessageAdapter(this.config.signingSecret)

    this.interactive.action({ type: 'button' }, this.handleButtonInteractiveAction.bind(this))
    this.interactive.action({ actionId: 'option_selected' }, this.handleOptionSelectedInteractiveAction.bind(this))
    this.handleInteractiveRequest = this.interactive.requestListener()
    await this.printWebhook('interactive')

    this.events.on('message', this.handleMessageEvent.bind(this))
    this.events.on('error', (err) => this.logger.error('An error occurred.', err))
    this.handleEventRequest = this.events.requestListener()
    await this.printWebhook('events')
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), ...SlackRenderers]
  }

  protected setupSenders() {
    return [new TypingSender(), ...SlackSenders]
  }

  private async handleButtonInteractiveAction(payload: any) {
    try {
      const action = payload?.actions?.[0]
      const actionId = action?.action_id

      if (actionId.startsWith('discard_action')) {
        return
      } else if (actionId.startsWith('quick_reply')) {
        await axios.post(payload.response_url, { text: `*${action?.text?.text}*` })
        await this.app.instances.receive(this.conduitId, {
          ctx: payload,
          content: { type: 'quick_reply', text: action?.text?.text, payload: action?.value }
        })
      } else if (actionId.startsWith('say_something')) {
        await this.app.instances.receive(this.conduitId, {
          ctx: payload,
          content: { type: 'say_something', text: action?.value }
        })
      } else {
        await this.app.instances.receive(this.conduitId, {
          ctx: payload,
          content: { type: 'postback', payload: action?.value }
        })
      }
    } catch (e) {
      this.logger.error('Error occurred while processing a "button" interactive action.', e)
    }
  }

  private async handleOptionSelectedInteractiveAction(payload: any) {
    try {
      const action = payload?.actions?.[0]?.selected_option
      const label = action?.text?.text

      await axios.post(payload.response_url, { text: `*${label}*` })

      await this.app.instances.receive(this.conduitId, {
        ctx: payload,
        content: { type: 'quick_reply', text: label, payload: action?.value }
      })
    } catch (e) {
      this.logger.error('Error occurred while processing a "option_selected" interactive action.', e)
    }
  }

  private async handleMessageEvent(payload: any) {
    try {
      if (payload.bot_id || ['bot_message', 'message_deleted', 'message_changed'].includes(payload.subtype)) {
        return
      }

      await this.app.instances.receive(this.conduitId, {
        ctx: payload,
        content: {
          type: 'text',
          text: payload.text
        }
      })
    } catch (e) {
      this.logger.error('Error occurred while processing a slack message.', e)
    }
  }

  public async extractEndpoint(payload: { ctx: any; content: any }): Promise<EndpointContent> {
    const { user, channel } = payload.ctx

    const channelId = channel?.id || channel
    const userId = user?.id || user

    return {
      content: payload.content,
      sender: userId,
      thread: channelId
    }
  }

  protected async getContext(base: ChannelContext<any>): Promise<SlackContext> {
    return {
      ...base,
      client: { web: this.client, events: this.events, interactive: this.interactive },
      message: { blocks: [] }
    }
  }
}
