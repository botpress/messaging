export interface Endpoint {
  channel: string | { name: string; version: string }
  identity: string
  sender: string
  thread: string
}
