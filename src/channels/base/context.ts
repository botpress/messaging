export interface ChannelContext<Client> {
  client: Client
  handlers: string[]
  payload: any
}
