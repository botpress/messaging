import redis, { Redis } from 'ioredis'
import { Service } from '../base/service'

export class DistributedService extends Service {
  private pub!: Redis
  private sub!: Redis
  private callbacks: { [channel: string]: (message: object) => Promise<void> } = {}

  async setup() {
    this.pub = new redis()
    this.sub = new redis()

    this.sub.on('message', (channel, message) => {
      const callback = this.callbacks[channel]
      if (callback) {
        void callback(JSON.parse(message))
      }
    })
  }

  async destroy() {
    await this.pub.quit()
    await this.sub.quit()
  }

  async listen(channel: string, callback: (message: object) => Promise<void>) {
    await this.sub.subscribe(channel)
    this.callbacks[channel] = callback
  }

  async send(channel: string, message: object) {
    await this.pub.publish(channel, JSON.stringify(message))
  }
}
