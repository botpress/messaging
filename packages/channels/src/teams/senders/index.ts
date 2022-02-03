import { TeamsCommonSender } from './common'
import { TeamsTypingSender } from './typing'

export const TeamsSenders = [new TeamsTypingSender(), new TeamsCommonSender()]
