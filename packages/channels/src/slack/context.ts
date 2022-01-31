import { Block, KnownBlock } from '@slack/bolt'
import { ChatPostMessageArguments } from '@slack/web-api'
import { ChannelContext } from '../base/context'
import { SlackState } from './service'

export type SlackContext = ChannelContext<SlackState> & {
  message: ChatPostMessageArguments & { blocks: (KnownBlock | Block)[] }
}
