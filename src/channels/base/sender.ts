import { ChannelContext } from './context'

export interface ChannelSender<TContext extends ChannelContext<any>> {
  priority: number

  handles(context: TContext): boolean
  send(context: TContext): Promise<void>
}
