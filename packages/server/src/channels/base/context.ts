import { Logger } from '../../logger/types'
import { Endpoint } from '../../mapping/types'

export type ChannelContext<TClient> = {
  client: TClient
  handlers: number
  payload: any
  logger: Logger
} & Endpoint

export interface IndexChoiceOption {
  type: IndexChoiceType
  title: string
  value: string
}

export enum IndexChoiceType {
  OpenUrl = 'open_url',
  PostBack = 'postback',
  SaySomething = 'say_something',
  QuickReply = 'quick_reply'
}
