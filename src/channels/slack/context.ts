import SlackEventAdapter from '@slack/events-api/dist/adapter'
import { SlackMessageAdapter } from '@slack/interactive-messages'
import { ChatPostMessageArguments, WebClient } from '@slack/web-api'
import { ChannelContext } from '../base/context'

export interface SlackEndpoints {
  web: WebClient
  events: SlackEventAdapter
  interactive: SlackMessageAdapter
}

export type SlackContext = ChannelContext<SlackEndpoints> & {
  message: Partial<ChatPostMessageArguments>
  channelId: string
}
