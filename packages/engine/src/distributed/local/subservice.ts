import { DistributedSubservice } from '../base/subservice'
import { Lock } from '../types'

const DEFAULT_LOCK_TTL = 2000
const MAX_LOCK_ATTEMPT = 10
const LOCK_ATTEMPT_INTERVAL = 200
const LOCK_ATTEMPT_INTERVAL_JITTER = 100

export class LocalSubservice implements DistributedSubservice {
  private locks: { [ressource: string]: Date } = {}

  async setup() {}

  async destroy() {}

  async subscribe(channel: string, callback: (message: any, channel: string) => Promise<void>) {}

  async unsubscribe(channel: string) {}

  async publish(channel: string, message: any) {}

  async lock(ressource: string): Promise<Lock> {
    let attemptCount = 0

    return new Promise<Lock>((resolve, reject) => {
      const attempt = () => {
        const lock = this.tryGetLock(ressource)
        if (lock) {
          resolve(lock)
        } else if (attemptCount < MAX_LOCK_ATTEMPT) {
          attemptCount++
          setTimeout(attempt, LOCK_ATTEMPT_INTERVAL + Math.random() * LOCK_ATTEMPT_INTERVAL_JITTER)
        } else {
          reject(new Error('Failed to acquire lock. Already in use'))
        }
      }

      attempt()
    })
  }

  async release(lock: Lock) {
    delete this.locks[lock.ressource]
  }

  private tryGetLock(ressource: string) {
    if (!this.locks[ressource] || this.locks[ressource] < new Date()) {
      this.locks[ressource] = new Date(new Date().getTime() + DEFAULT_LOCK_TTL)
      return { ressource }
    } else {
      return undefined
    }
  }
}
