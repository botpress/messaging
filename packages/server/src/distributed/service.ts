import yn from 'yn'
import { Service } from '../base/service'
import { ConfigService } from '../config/service'
import { DistributedSubservice } from './base/subservice'
import { LocalSubservice } from './local/subservice'
import { RedisConfig } from './redis/config'
import { RedisSubservice } from './redis/subservice'
import { Lock } from './types'

export class DistributedService extends Service {
  private subservice!: DistributedSubservice

  constructor(private configService: ConfigService) {
    super()
  }

  async setup() {
    const config = (this.configService.current.redis || {}) as RedisConfig

    if (yn(process.env.CLUSTER_ENABLED) || config.enabled) {
      this.subservice = new RedisSubservice(config)
    } else {
      this.subservice = new LocalSubservice()
    }

    await this.subservice.setup()
  }

  async destroy() {
    await this.subservice.destroy()
  }

  async listen(channel: string, callback: (message: any) => Promise<void>) {
    return this.subservice.listen(channel, callback)
  }

  async send(channel: string, message: any) {
    return this.subservice.send(channel, message)
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
