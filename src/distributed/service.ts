import redis, { Redis } from 'ioredis'
import { Service } from '../base/service'
import { LoggerService } from '../logger/service'
import { Logger } from '../logger/types'

export class DistributedService extends Service {
  private logger: Logger
  private pub!: Redis
  private sub!: Redis
  private callbacks: { [channel: string]: (message: object) => Promise<void> } = {}

  constructor(loggers: LoggerService) {
    super()
    this.logger = loggers.root.sub('Distributed')
  }

  async setup() {
    this.logger.info('Service setup!')

    this.pub = new redis()
    this.sub = new redis()

    this.sub.on('message', (channel, message) => {
      const callback = this.callbacks[channel]
      if (this.callbacks[channel]) {
        void callback(JSON.parse(message))
      }
      this.logger.info('REDIS SUB', { channel, message })
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
