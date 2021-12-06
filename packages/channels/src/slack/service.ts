import { createEventAdapter } from '@slack/events-api'
import SlackEventAdapter from '@slack/events-api/dist/adapter'
import { createMessageAdapter, SlackMessageAdapter } from '@slack/interactive-messages'
import { WebClient } from '@slack/web-api'
import { RequestListener } from 'http'
import { ChannelService, ChannelState } from '../base/service'
import { SlackConfig } from './config'

export interface SlackState extends ChannelState<SlackConfig> {
  client: WebClient
  interactive: SlackMessageAdapter
  events: SlackEventAdapter
  handleInteractiveRequest?: RequestListener
  handleEventRequest?: RequestListener
}

export class SlackService extends ChannelService<SlackConfig, SlackState> {
  async create(scope: string, config: SlackConfig) {
    return {
      config,
      client: new WebClient(config.botToken),
      events: createEventAdapter(config.signingSecret),
      interactive: createMessageAdapter(config.signingSecret)
    }
  }
}
