import { ChannelContext } from './context'

export interface ChannelRenderer<Context extends ChannelContext<any>> {
  priority: number

  handles(context: Context): boolean
  render(context: Context): void
}
