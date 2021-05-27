import { DiscordCommonSender } from './common'
import { DiscordTypingSender } from './typing'

export const DiscordSenders = [new DiscordTypingSender(), new DiscordCommonSender()]
