import { SmoochCommonSender } from './common'
import { SmoochTypingSender } from './typing'

export const SmoochSenders = [new SmoochTypingSender(), new SmoochCommonSender()]
