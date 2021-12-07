import { TelegramCommonSender } from './common'
import { TelegramTypingSender } from './typing'

export const TelegramSenders = [new TelegramTypingSender(), new TelegramCommonSender()]
