export interface ChannelContext<TClient> {
  client: TClient
  handlers: string[]
  payload: any
  botUrl: string
}
