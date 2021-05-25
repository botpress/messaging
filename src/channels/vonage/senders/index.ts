import { VonageCommonSender } from './common'
import { VonageTypingSender } from './typing'

export const VonageSenders = [new VonageTypingSender(), new VonageCommonSender()]
