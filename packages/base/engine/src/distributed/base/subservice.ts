import { Lock } from '../types'

export interface DistributedSubservice {
  setup(): Promise<void>
  destroy(): Promise<void>
  subscribe(channel: string, callback: (message: any, channel: string) => Promise<void>): Promise<void>
  unsubscribe(channel: string): Promise<void>
  publish(channel: string, message: any): Promise<void>
  lock(ressource: string): Promise<Lock>
  release(lock: Lock): Promise<void>
}
