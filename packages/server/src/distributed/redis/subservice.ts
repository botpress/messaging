import clc from 'cli-color'
import redis, { ClusterOptions, Redis, RedisOptions } from 'ioredis'
import _ from 'lodash'
import Redlock from 'redlock'
import { Logger } from '../../logger/types'
import { DistributedSubservice } from '../base/subservice'
import { RedisConfig } from './config'
import { PingPong } from './ping'

const DEFAULT_LOCK_TTL = 2000

export class RedisSubservice implements DistributedSubservice {
  public static nodeId = Math.round(Math.random() * 1000000)

  private logger: Logger = new Logger('Redis')
  private pub!: Redis
  private sub!: Redis
  private redlock!: Redlock
  private locks: { [ressource: string]: RedisLock } = {}
  private callbacks: { [channel: string]: (message: any) => Promise<void> } = {}
  private pings!: PingPong
  private scope!: string

  constructor(private config: RedisConfig) {}

  async setup() {
    this.logger.info(`Id is ${clc.bold(RedisSubservice.nodeId)}`)

    this.scope = process.env.REDIS_SCOPE || this.config.scope
    this.pub = this.setupClient()
    this.sub = this.setupClient()
    this.redlock = new Redlock([this.pub])

    this.sub.on('message', (channel, message) => {
      const callback = this.callbacks[channel]
      if (callback) {
        const parsed = JSON.parse(message)
        if (parsed.nodeId !== RedisSubservice.nodeId) {
          delete parsed.nodeId
          void callback(parsed)
        }
      }
    })

    this.pings = new PingPong(RedisSubservice.nodeId, this, this.logger)
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
        throw new Error('Unable to connect to the Redis cluster after multiple attempts')
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
    const now = new Date()

    for (const lock of Object.values(this.locks || {})) {
      if (lock.expiry > now) {
        try {
          await this.release(lock)
        } catch (e) {
          this.logger.error(e, 'Failed to release lock', _.omit(lock, 'lock'))
        }
      }
    }

    try {
      await this.pub.quit()
      await this.sub.quit()
    } catch (e) {
      this.logger.error(e, 'Failed to destroy connections')
    }
  }

  async listen(channel: string, callback: (message: any) => Promise<void>) {
    const scopedChannel = this.makeScopedChannel(channel)

    await this.sub.subscribe(scopedChannel)
    this.callbacks[scopedChannel] = callback
  }

  async send(channel: string, message: any) {
    const scopedChannel = this.makeScopedChannel(channel)

    await this.pub.publish(scopedChannel, JSON.stringify({ nodeId: RedisSubservice.nodeId, ...message }))
  }

  async lock(ressource: string) {
    const ttl = DEFAULT_LOCK_TTL
    const lock = {
      lock: await this.redlock.acquire(ressource, ttl),
      ressource,
      expiry: new Date(new Date().getTime() + ttl)
    }
    this.locks[ressource] = lock
    return lock
  }

  async release(lock: RedisLock) {
    await this.redlock.release(lock.lock)
    delete this.locks[lock.ressource]
  }

  private makeScopedChannel(key: string): string {
    return this.scope ? `${this.scope}/${key}` : key
  }
}

interface RedisLock {
  ressource: string
  expiry: Date
  lock: Redlock.Lock
}
