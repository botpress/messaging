import { DistributedSubservice } from '../base/subservice'
import { Lock } from '../types'

export class LocalSubservice implements DistributedSubservice {
  async setup() {}

  async destroy() {}

  async listen(channel: string, callback: (message: any) => Promise<void>) {}

  async send(channel: string, message: any) {}

  async lock(ressource: string): Promise<Lock> {
    return { ressource }
  }

  async release(lock: Lock) {}
}
