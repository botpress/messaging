import { ChannelContext } from './context'

export interface ChannelSender<Context extends ChannelContext<any>> {
  priority: number

  handles(context: Context): boolean
  send(context: Context): Promise<void>
}
