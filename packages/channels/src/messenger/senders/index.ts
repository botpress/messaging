import { MessengerCommonSender } from './common'
import { MessengerTypingSender } from './typing'

export const MessengerSenders = [new MessengerTypingSender(), new MessengerCommonSender()]
