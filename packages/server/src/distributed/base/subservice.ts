export interface DistributedSubservice {
  setup(): Promise<void>
  destroy(): Promise<void>
  listen(channel: string, callback: (message: any) => Promise<void>): Promise<void>
  send(channel: string, message: any): Promise<void>
}
