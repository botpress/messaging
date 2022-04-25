import { ChannelContext } from './context'

export interface ChannelRenderer<TContext extends ChannelContext<any>> {
  priority: number

  handles(context: TContext): boolean
  render(context: TContext): void
}
