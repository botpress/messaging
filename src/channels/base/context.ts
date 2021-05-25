import { Logger } from '../../logger/service'
import { Mapping } from '../../mapping/service'

export type ChannelContext<TClient> = {
  client: TClient
  handlers: number
  payload: any
  botUrl: string
  logger: Logger
} & Mapping
