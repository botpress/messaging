import yn from 'yn'
import { Service } from '../base/service'
import { DistributedSubservice } from './base/subservice'
import { LocalSubservice } from './local/subservice'
import { RedisSubservice } from './redis/subservice'
import { Lock } from './types'

export class DistributedService extends Service {
  private subservice!: DistributedSubservice

  async setup() {
    if (yn(process.env.CLUSTER_ENABLED)) {
      this.subservice = new RedisSubservice()
    } else {
      this.subservice = new LocalSubservice()
    }

    await this.subservice.setup()
  }

  async destroy() {
    if (!this.subservice) {
      return
    }

    await this.subservice.destroy()
  }

  async subscribe(channel: string, callback: (message: any, channel: string) => Promise<void>) {
    return this.subservice.subscribe(channel, callback)
  }

  async unsubscribe(channel: string) {
    return this.subservice.unsubscribe(channel)
  }

  async publish(channel: string, message: any) {
    return this.subservice.publish(channel, message)
  }

  async using(ressource: string, callback: () => Promise<void>) {
    const lock = await this.lock(ressource)
    try {
      await callback()
    } catch (e) {
      throw e
    } finally {
      await this.release(lock)
    }
  }

  private async lock(ressource: string): Promise<Lock> {
    return this.subservice.lock(ressource)
  }

  private async release(lock: Lock) {
    await this.subservice.release(lock)
  }
}
