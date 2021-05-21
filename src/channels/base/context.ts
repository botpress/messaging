import { Mapping } from '../../mapping/service'

export type ChannelContext<TClient> = {
  client: TClient
  handlers: string[]
  payload: any
  botUrl: string
} & Mapping
