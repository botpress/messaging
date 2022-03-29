import clc from 'cli-color'
import redis, { ClusterOptions, Redis, RedisOptions } from 'ioredis'
import _ from 'lodash'
import Redlock from 'redlock'
import { Logger } from '../../logger/types'
import { DistributedSubservice } from '../base/subservice'
import { Lock } from '../types'
import { PingPong } from './ping'

const DEFAULT_LOCK_TTL = 3000

export class RedisSubservice implements DistributedSubservice {
  // TODO: Remove evil static keyword here when we refactor the logging
  public static nodeId = Math.round(Math.random() * 1000000)

  private logger: Logger = new Logger('Redis')
  private pub!: Redis
  private sub!: Redis
  private redlock!: Redlock
  private locks: { [ressource: string]: RedisLock } = {}
  private callbacks: { [channel: string]: (message: any, channel: string) => Promise<void> } = {}
  private pings!: PingPong
  private scope!: string
  private destroyed: boolean = false

  async setup() {
    this.logger.info(`Id is ${clc.bold(RedisSubservice.nodeId)}`)

    this.scope = process.env.REDIS_SCOPE!
    this.pub = this.setupClient()
    this.sub = this.setupClient()
    this.redlock = new Redlock([this.pub])

    this.sub.on('message', (channel, message) => {
      const callback = this.callbacks[channel]
      if (callback) {
        const parsed = JSON.parse(message)
        if (parsed.nodeId !== RedisSubservice.nodeId) {
          delete parsed.nodeId
          void this.callCallback(callback, parsed, channel)
        }
      }
    })

    this.pings = new PingPong(RedisSubservice.nodeId, this, this.logger)
    await this.pings.setup()
  }

  private async callCallback(
    callback: (message: any, channel: string) => Promise<void>,
    message: any,
    channel: string
  ) {
    try {
      await callback(message, channel)
    } catch (e) {
      this.logger.error(e, 'Error occured in callback', channel)
    }
  }

  private setupClient(): Redis {
    let connection = undefined
    let options = {}

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
      if (this.destroyed) {
        throw new Error('Unable to connect to the Redis cluster after multiple attempts')
      }
      return Math.min(times * 200, 5000)
    }

    const redisOptions: RedisOptions = {
      retryStrategy,
      sentinelRetryStrategy: retryStrategy
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
    this.destroyed = true

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

  async subscribe(channel: string, callback: (message: any, channel: string) => Promise<void>) {
    const scopedChannel = this.makeScopedChannel(channel)

    await this.sub.subscribe(scopedChannel)
    this.callbacks[scopedChannel] = callback
  }

  async unsubscribe(channel: string) {
    const scopedChannel = this.makeScopedChannel(channel)
    await this.sub.unsubscribe(scopedChannel)
    delete this.callbacks[scopedChannel]
  }

  async publish(channel: string, message: any) {
    const scopedChannel = this.makeScopedChannel(channel)
    await this.pub.publish(scopedChannel, JSON.stringify({ nodeId: RedisSubservice.nodeId, ...message }))
  }

  async lock(ressource: string) {
    const ttl = DEFAULT_LOCK_TTL
    const lock: RedisLock = {
      lock: await this.redlock.acquire(ressource, ttl),
      ressource,
      expiry: new Date(new Date().getTime() + ttl)
    }
    this.locks[ressource] = lock

    lock.timeout = setTimeout(() => {
      void this.refresh(ressource)
    }, DEFAULT_LOCK_TTL / 2)

    return lock
  }

  async refresh(ressource: string) {
    try {
      await this.locks[ressource].lock.extend(DEFAULT_LOCK_TTL / 3)

      this.locks[ressource].timeout = setTimeout(() => {
        void this.refresh(ressource)
      }, DEFAULT_LOCK_TTL / 6)
    } catch (e) {
      this.logger.error(e, `Failed to extend lock ${ressource}`)
    }
  }

  async release(lock: RedisLock) {
    if (lock.timeout) {
      clearTimeout(lock.timeout)
    }

    await this.redlock.release(lock.lock)
    delete this.locks[lock.ressource]
  }

  private makeScopedChannel(key: string): string {
    return this.scope ? `${this.scope}/${key}` : key
  }
}

interface RedisLock extends Lock {
  expiry: Date
  lock: Redlock.Lock
  timeout?: NodeJS.Timeout
}
