import redis, { Redis } from 'ioredis'
import { Logger } from '../../logger/types'
import { DistributedSubservice } from '../base/subservice'
import { RedisConfig } from './config'
import { PingPong } from './pings'

export class RedisSubservice implements DistributedSubservice {
  private logger: Logger = new Logger('Redis')
  private nodeId!: number
  private pub!: Redis
  private sub!: Redis
  private callbacks: { [channel: string]: (message: any) => Promise<void> } = {}
  private pings!: PingPong

  constructor(private config: RedisConfig) {}

  async setup() {
    this.nodeId = Math.round(Math.random() * 1000000)
    this.logger.info(`Id is ${this.nodeId}`)

    this.pub = new redis(this.config.url)
    this.sub = new redis(this.config.url)

    this.sub.on('message', (channel, message) => {
      const callback = this.callbacks[channel]
      if (callback) {
        const parsed = JSON.parse(message)
        if (parsed.nodeId !== this.nodeId) {
          delete parsed.nodeId
          void callback(parsed)
        }
      }
    })

    this.pings = new PingPong(this.nodeId, this)
    await this.pings.setup()
  }

  async destroy() {
    await this.pub.quit()
    await this.sub.quit()
  }

  async listen(channel: string, callback: (message: any) => Promise<void>) {
    await this.sub.subscribe(channel)
    this.callbacks[channel] = callback
  }

  async send(channel: string, message: any) {
    await this.pub.publish(channel, JSON.stringify({ nodeId: this.nodeId, ...message }))
  }
}
