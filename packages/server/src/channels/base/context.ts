import { Logger } from '../../logger/types'
import { Endpoint } from '../../mapping/types'

export type ChannelContext<TClient> = {
  client: TClient
  handlers: number
  payload: any
  botUrl: string
  logger: Logger
} & Endpoint
