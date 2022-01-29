import { ChannelContext } from '../base/context'
import { SlackState } from './service'

export type SlackContext = ChannelContext<SlackState> & {}
