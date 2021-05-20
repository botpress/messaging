import { createEventAdapter } from '@slack/events-api'
import SlackEventAdapter from '@slack/events-api/dist/adapter'
import { createMessageAdapter, SlackMessageAdapter } from '@slack/interactive-messages'
import { WebClient } from '@slack/web-api'
import axios from 'axios'
import { Router } from 'express'
import _ from 'lodash'
import { ConversationService } from '../../conversations/service'
import { KvsService } from '../../kvs/service'
import { MessageService } from '../../messages/service'
import { Channel } from '../base/channel'
import { Routers } from '../types'
import { SlackConfig } from './config'
import { SlackContext } from './context'
import { SlackCardRenderer } from './renderers/card'
import { SlackCarouselRenderer } from './renderers/carousel'
import { SlackChoicesRenderer } from './renderers/choices'
import { SlackFeedbackRenderer } from './renderers/feedback'
import { SlackImageRenderer } from './renderers/image'
import { SlackTextRenderer } from './renderers/text'
import { SlackCommonSender } from './senders/common'
import { SlackTypingSender } from './senders/typing'

export class SlackChannel extends Channel {
  private renderers = [
    new SlackCardRenderer(),
    new SlackTextRenderer(),
    new SlackImageRenderer(),
    new SlackCarouselRenderer(),
    new SlackChoicesRenderer(),
    new SlackFeedbackRenderer()
  ]
  private senders = [new SlackTypingSender(), new SlackCommonSender()]

  private config!: SlackConfig
  private kvs!: KvsService
  private conversations!: ConversationService
  private messages!: MessageService
  private router!: Router

  private client!: WebClient
  private interactive!: SlackMessageAdapter
  private events!: SlackEventAdapter

  private botId: string = 'default'

  get id(): string {
    return 'slack'
  }

  async setup(
    config: SlackConfig,
    kvsService: KvsService,
    conversationService: ConversationService,
    messagesService: MessageService,
    routers: Routers
  ): Promise<void> {
    this.config = config
    this.kvs = kvsService
    this.conversations = conversationService
    this.messages = messagesService
    this.router = routers.raw

    this.client = new WebClient(this.config.botToken)
    this.events = createEventAdapter(this.config.signingSecret!)
    this.interactive = createMessageAdapter(this.config.signingSecret!)

    await this._setupRealtime()
    await this._setupInteractiveListener()
  }

  private async _setupInteractiveListener() {
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

        await this.receive(payload, { type: 'quick_reply', text: label, payload: value })
      }
    })

    this.interactive.action({ actionId: 'option_selected' }, async (payload) => {
      const label = _.get(payload, 'actions[0].selected_option.text.text', '')
      const value = _.get(payload, 'actions[0].selected_option.value', '')

      //  await axios.post(payload.response_url, { text: `*${label}*` })
      await this.receive(payload, { type: 'quick_reply', text: label, payload: value })
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

    this.router.use('/webhooks/slack/interactive', this.interactive.requestListener())
    await this.displayUrl('interactive', '/webhooks/slack/interactive')
  }

  private async _setupRealtime() {
    this.listenMessages(this.events)
    this.router.post('/webhooks/slack/events', this.events.requestListener())
    await this.displayUrl('events', '/webhooks/slack/events')
  }

  private listenMessages(com: SlackEventAdapter) {
    const discardedSubtypes = ['bot_message', 'message_deleted', 'message_changed']

    com.on('message', async (payload) => {
      // debugIncoming('Received real time payload %o', payload)

      if (!discardedSubtypes.includes(payload.subtype) && !payload.bot_id) {
        await this.receive(payload, {
          type: 'text',
          text: _.find(_.at(payload, ['text', 'files.0.name', 'files.0.title']), (x) => x && x.length) || 'N/A'
        })
      }
    })

    // com.on('error', (err) => this.bp.logger.attachError(err).error('An error occurred'))
  }

  private async displayUrl(title: string, end: string) {
    const publicPath = await this.config.externalUrl
    console.log(`Slack ${title} webhook listening at ${publicPath + end}`)
  }

  async receive(ctx: any, payload: any) {
    const channelId = _.get(ctx, 'channel.id') || _.get(ctx, 'channel')
    const userId = _.get(ctx, 'user.id') || _.get(ctx, 'user')

    // TODO: mapping
    const conversation = await this.conversations.forBot(this.botId).recent(channelId)
    const message = await this.messages.forBot(this.botId).create(conversation.id, payload, userId)
    console.log('slack send webhook', message)
  }

  async send(conversationId: string, payload: any): Promise<void> {
    const conversation = await this.conversations.forBot(this.botId).get(conversationId)

    const context: SlackContext = {
      client: { web: this.client, events: this.events, interactive: this.interactive },
      handlers: [],
      payload: _.cloneDeep(payload),
      // TODO: bot url
      botUrl: 'https://duckduckgo.com/',
      message: { blocks: [] },
      channelId: conversation?.userId!
    }

    for (const renderer of this.renderers) {
      if (renderer.handles(context)) {
        renderer.render(context)

        // TODO: do we need ids?
        context.handlers.push('id')
      }
    }

    for (const sender of this.senders) {
      if (sender.handles(context)) {
        await sender.send(context)
      }
    }
  }
}
