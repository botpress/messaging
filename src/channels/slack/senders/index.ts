import { SlackCommonSender } from './common'
import { SlackTypingSender } from './typing'

export const SlackSenders = [new SlackTypingSender(), new SlackCommonSender()]
