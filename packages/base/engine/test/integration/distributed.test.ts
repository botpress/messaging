import { DistributedService } from '../../src'
import { RedisSubservice } from '../../src/distributed/redis/subservice'
import { setupApp, destroyApp, engine } from '../utils'

const describeif = (condition: boolean) => (condition ? describe : describe.skip)

describe.each(['redis', 'local'])('DistributedService (%s)', (service) => {
  const channelName = 'test'
  const resourceName = 'test'
  const message = 'test'
  const redisEnabled = service === 'redis' && process.env.CLUSTER_ENABLED === 'true'
  const local = service === 'local' && process.env.CLUSTER_ENABLED !== 'true'

  let distributed: DistributedService

  beforeAll(async () => {
    await setupApp()

    distributed = engine.distributed
  })

  afterAll(async () => {
    await destroyApp()
  })

  beforeEach(async () => {
    engine.caching.resetAll()
  })

  const publishFromAnotherNode = async () => {
    const subservice = new RedisSubservice()
    await subservice.setup()
    // TODO: change this once nodeId is not static anymore
    // The fact that it is static forces use to re-implement the call to publish and fake the nodeId
    const scopedChannel = subservice['makeScopedChannel'](channelName)
    await subservice['pub'].publish(scopedChannel, JSON.stringify({ nodeId: 1, message }))
    await subservice.destroy()
  }

  const wait = async (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  describeif(redisEnabled)('Subscribe ', () => {
    test('Should be able to subscribe to a channel', async () => {
      const callback = jest.fn()

      await distributed.subscribe(channelName, callback)

      expect(callback).toHaveBeenCalledTimes(0)

      await publishFromAnotherNode()

      // Wait for redis to propagate the message
      await wait(5000)

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith({ message }, channelName)
    }, 15_000)
  })

  describeif(redisEnabled)('Publish', () => {
    test('Should be able to publish multiple messages to a channel', async () => {
      const callback = jest.fn()
      const count = 5

      await distributed.subscribe(channelName, callback)

      expect(callback).toHaveBeenCalledTimes(0)

      const message = 'test'
      for (let i = 0; i < count; i++) {
        await publishFromAnotherNode()
      }

      await wait(5000)

      expect(callback).toHaveBeenCalledTimes(count)
      for (let i = 1; i <= count; i++) {
        expect(callback).toHaveBeenNthCalledWith(i, { message }, channelName)
      }
    }, 15_000)
  })

  describeif(redisEnabled)('Unsubscribe', () => {
    test('Should be able to unsubscribe from a channel', async () => {
      const callback = jest.fn()

      await distributed.subscribe(channelName, callback)
      await distributed.unsubscribe(channelName)

      expect(callback).toHaveBeenCalledTimes(0)

      await publishFromAnotherNode()

      await wait(5000)

      expect(callback).toHaveBeenCalledTimes(0)
    }, 15_000)
  })

  describeif(redisEnabled || local)('Using', () => {
    test('Should be able to lock a resource for some amount of time', async () => {
      const waitTime = 1000
      const callback = jest.fn()
      const secondCallback = jest.fn()

      const secondDistributed = new DistributedService()
      await secondDistributed.setup()

      void distributed.using(resourceName, async () => {
        callback()
        await wait(waitTime)
      })
      // Makes sure the lock is acquired by distributed before secondDistributed
      await wait(waitTime / 10)
      void secondDistributed.using(resourceName, secondCallback)

      expect(secondCallback).toHaveBeenCalledTimes(0)
      expect(callback).toHaveBeenCalledTimes(1)

      await wait(waitTime * 2)

      expect(secondCallback).toHaveBeenCalledTimes(1)

      await secondDistributed.destroy()
    }, 15_000)

    test('Should release the lock when the callback throws an error', async () => {
      const waitTime = 1000
      const callback = jest.fn()
      const secondCallback = jest.fn()

      const secondDistributed = new DistributedService()
      await secondDistributed.setup()

      void distributed
        .using(resourceName, async () => {
          await callback()
          await wait(waitTime / 10)
          await Promise.reject(new Error('test'))
          await wait(waitTime)
        })
        .catch(() => {})
      // Makes sure the lock is acquired by distributed before secondDistributed
      await wait(waitTime / 10)
      void secondDistributed.using(resourceName, secondCallback)

      expect(secondCallback).toHaveBeenCalledTimes(0)
      expect(callback).toHaveBeenCalledTimes(1)

      await wait(waitTime * 2)

      expect(secondCallback).toHaveBeenCalledTimes(1)

      await secondDistributed.destroy()
    }, 15_000)
  })

  describeif(redisEnabled || local)('Destroy', () => {
    test('Should be able to destroy the service', async () => {
      const secondDistributed = new DistributedService()
      await secondDistributed.setup()

      await secondDistributed.destroy()
    })

    test('Should be able to call destroy before setting up the service', async () => {
      const secondDistributed = new DistributedService()

      await secondDistributed.destroy()
    })
  })
})
