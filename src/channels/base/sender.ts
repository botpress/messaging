import { ChannelContext } from './context'

export interface ChannelSender<Context extends ChannelContext<any>> {
  id: string
  priority: number
  channel: string

  handles(context: Context): boolean
  send(context: Context): Promise<void>
}
