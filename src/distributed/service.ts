import redis, { Redis } from 'ioredis'
import { Service } from '../base/service'
import { PingPong } from './pings'

export class DistributedService extends Service {
  private nodeId!: number
  private pub!: Redis
  private sub!: Redis
  private callbacks: { [channel: string]: (message: any) => Promise<void> } = {}
  private pings!: PingPong

  async setup() {
    this.nodeId = Math.round(Math.random() * 1000000)
    this.pub = new redis()
    this.sub = new redis()

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
