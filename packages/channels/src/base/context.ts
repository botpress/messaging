import { Endpoint } from './endpoint'
import { Logger } from './logger'
import { ChannelState } from './service'

export type ChannelContext<TState extends ChannelState<any>> = {
  scope: string
  state: TState
  handlers: number
  payload: any
  logger?: Logger
} & Endpoint

export interface IndexChoiceOption {
  type: IndexChoiceType
  title: string
  value?: string
}

export enum IndexChoiceType {
  OpenUrl = 'open_url',
  PostBack = 'postback',
  SaySomething = 'say_something',
  QuickReply = 'quick_reply'
}
