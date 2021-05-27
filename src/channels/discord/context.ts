import Discord from 'discord.js'
import { ChannelContext } from '../base/context'

export interface DiscordMessage {
  content?: Discord.StringResolvable
  options?: Discord.MessageOptions
}

export type DiscordContext = ChannelContext<Discord.Client> & {
  channel: Discord.DMChannel | Discord.TextChannel
  messages: DiscordMessage[]
}
