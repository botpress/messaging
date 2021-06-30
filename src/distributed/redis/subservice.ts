import clc from 'cli-color'
import redis, { ClusterOptions, Redis, RedisOptions } from 'ioredis'
import _ from 'lodash'
import { Logger } from '../../logger/types'
import { DistributedSubservice } from '../base/subservice'
import { RedisConfig } from './config'
import { PingPong } from './ping'

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
    this.logger.info(`Id is ${clc.bold(this.nodeId)}`)

    this.pub = this.setupClient()
    this.sub = this.setupClient()

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

    this.pings = new PingPong(this.nodeId, this, this.logger)
    await this.pings.setup()
  }

  private setupClient(): Redis {
    let connection = this.config.connection
    let options = this.config.options || {}

    if (process.env.REDIS_URL) {
      try {
        connection = JSON.parse(process.env.REDIS_URL)
      } catch {
        connection = process.env.REDIS_URL
      }
    }

    if (process.env.REDIS_OPTIONS) {
      try {
        options = JSON.parse(process.env.REDIS_OPTIONS) || {}
      } catch {
        this.logger.warn('REDIS_OPTIONS is not valid json')
      }
    }

    const retryStrategy = (times: number) => {
      if (times > 10) {
        throw new Error('Unable to connect to the Redis cluster after multiple attempts.')
      }
      return Math.min(times * 200, 5000)
    }

    const redisOptions: RedisOptions = {
      retryStrategy
    }

    if (_.isArray(connection)) {
      const clusterOptions: ClusterOptions = {
        clusterRetryStrategy: retryStrategy,
        redisOptions
      }

      return <any>new redis.Cluster(connection, _.merge(clusterOptions, options))
    } else {
      return new redis(connection, _.merge(redisOptions, options))
    }
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
