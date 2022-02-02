import { ChannelContext } from '../base/context'
import { SmoochState } from './service'
import { SmoochContent } from './smooch'

export type SmoochContext = ChannelContext<SmoochState> & {
  messages: SmoochContent[]
}
