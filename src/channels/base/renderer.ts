import { ChannelContext } from './context'

export interface ChannelRenderer<Context extends ChannelContext<any>> {
  id: string
  priority: number
  channel: string

  handles(context: Context): boolean
  render(context: Context): void
}
