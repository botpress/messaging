import { createEventAdapter } from '@slack/events-api'
import SlackEventAdapter from '@slack/events-api/dist/adapter'
import { createMessageAdapter, SlackMessageAdapter } from '@slack/interactive-messages'
import { WebClient } from '@slack/web-api'
import axios from 'axios'
import _ from 'lodash'
import { Channel, EndpointContent } from '../base/channel'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { SlackConfig } from './config'
import { SlackContext } from './context'
import { SlackRenderers } from './renderers'
import { SlackSenders } from './senders'

export class SlackChannel extends Channel<SlackConfig, SlackContext> {
  get id(): string {
    return 'slack'
  }

  private client!: WebClient
  private interactive!: SlackMessageAdapter
  private events!: SlackEventAdapter

  protected async setupConnection() {
    this.client = new WebClient(this.config.botToken)
    this.events = createEventAdapter(this.config.signingSecret!)
    this.interactive = createMessageAdapter(this.config.signingSecret!)

    // TODO: refactor these functions
    await this.setupRealtime()
    await this.setupInteractiveListener()
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), ...SlackRenderers]
  }

  protected setupSenders() {
    return SlackSenders
  }

  private async setupInteractiveListener() {
    this.interactive.action({ type: 'button' }, async (payload) => {
      // debugIncoming('Received interactive message %o', payload)

      const actionId = _.get(payload, 'actions[0].action_id', '')
      const label = _.get(payload, 'actions[0].text.text', '')
      const value = _.get(payload, 'actions[0].value', '')

      // Some actions (ex: open url) should be discarded
      if (!actionId.startsWith('discard_action')) {
        // Either we leave buttons displayed, we replace with the selection, or we remove it
        if (actionId.startsWith('replace_buttons')) {
          await axios.post(payload.response_url, { text: `*${label}*` })
        } else if (actionId.startsWith('remove_buttons')) {
          await axios.post(payload.response_url, { delete_original: true })
        }

        await this.receive({ ctx: payload, content: { type: 'quick_reply', text: label, payload: value } })
      }
    })

    this.interactive.action({ actionId: 'option_selected' }, async (payload) => {
      const label = _.get(payload, 'actions[0].selected_option.text.text', '')
      const value = _.get(payload, 'actions[0].selected_option.value', '')

      //  await axios.post(payload.response_url, { text: `*${label}*` })
      await this.receive({ ctx: payload, content: { type: 'quick_reply', text: label, payload: value } })
    })

    this.interactive.action({ actionId: 'feedback-overflow' }, async (payload) => {
      // debugIncoming('Received feedback %o', payload)

      const action = payload.actions[0]
      const blockId = action.block_id
      const selectedOption = action.selected_option.value

      const incomingEventId = blockId.replace('feedback-', '')
      const feedback = parseInt(selectedOption)

      // TODO: this can't work
      // const events = await this.bp.events.findEvents({ incomingEventId, direction: 'incoming' })
      // const event = events[0]
      // await this.bp.events.updateEvent(event.id, { feedback })
    })

    this.router.use('/interactive', this.interactive.requestListener())
    console.log(`Slack interactive webhook listening at ${this.config.externalUrl + this.route('interactive')}`)
  }

  private async setupRealtime() {
    this.listenMessages(this.events)
    this.router.post('/events', this.events.requestListener())
    console.log(`Slack events webhook listening at ${this.config.externalUrl + this.route('events')}`)
  }

  private listenMessages(com: SlackEventAdapter) {
    const discardedSubtypes = ['bot_message', 'message_deleted', 'message_changed']

    com.on('message', async (payload) => {
      // debugIncoming('Received real time payload %o', payload)

      if (!discardedSubtypes.includes(payload.subtype) && !payload.bot_id) {
        await this.receive({
          ctx: payload,
          content: {
            type: 'text',
            text: _.find(_.at(payload, ['text', 'files.0.name', 'files.0.title']), (x) => x && x.length) || 'N/A'
          }
        })
      }
    })

    // com.on('error', (err) => this.bp.logger.attachError(err).error('An error occurred'))
  }

  protected async map(payload: { ctx: any; content: any }): Promise<EndpointContent> {
    const { user, channel } = payload.ctx

    // TODO: are the || really necessary?
    const channelId = channel?.id || channel
    const userId = user?.id || user

    return {
      content: payload.content,
      foreignUserId: userId,
      foreignConversationId: channelId
    }
  }

  protected async context(base: ChannelContext<any>): Promise<SlackContext> {
    return {
      ...base,
      client: { web: this.client, events: this.events, interactive: this.interactive },
      message: { blocks: [] }
    }
  }
}
