import { DistributedSubservice } from '../base/subservice'
import { Lock } from '../types'

export class LocalSubservice implements DistributedSubservice {
  private locks: { [ressource: string]: boolean } = {}

  async setup() {}

  async destroy() {}

  async listen(channel: string, callback: (message: any) => Promise<void>) {}

  async send(channel: string, message: any) {}

  async lock(ressource: string): Promise<Lock> {
    if (!this.locks[ressource]) {
      this.locks[ressource] = true
      return { ressource }
    } else {
      throw new Error('Failed to acquire lock. Already in use.')
    }
  }

  async release(lock: Lock) {
    delete this.locks[lock.ressource]
  }
}
