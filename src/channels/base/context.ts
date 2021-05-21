import { Mapping } from '../../mapping/service'

export type ChannelContext<TClient> = {
  client: TClient
  handlers: number
  payload: any
  botUrl: string
} & Mapping
