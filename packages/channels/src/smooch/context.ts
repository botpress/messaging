import { ChannelContext } from '../base/context'
import { SmoochState } from './service'

export type SmoochContext = ChannelContext<SmoochState> & {
  messages: any[]
}
