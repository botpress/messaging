import { Batcher, BatchingService, DelayedBatcher, ImmediateBatcher } from '../../src'
import { setupApp, destroyApp, engine } from '../utils'

describe('BatchingService', () => {
  let batching: BatchingService
  let state: {
    batcher1?: Batcher<string>
    batcherId1: string
    batcherOnFlush1: (batch: string[]) => Promise<void>

    batcher2?: Batcher<string>
    batcherId2: string
    batcherOnFlush2: (batch: string[]) => Promise<void>
  }

  beforeAll(async () => {
    await setupApp()

    batching = engine.batching

    state = {
      batcherId1: 'id1',
      batcherOnFlush1: async (_b: string[]) => {},

      batcherId2: 'id2',
      batcherOnFlush2: async (_b: string[]) => {}
    }
  })

  afterAll(async () => {
    await destroyApp()
  })

  beforeEach(async () => {
    engine.caching.resetAll()
  })

  describe('NewBatcher', () => {
    test('Should be able to create batchers', async () => {
      state.batcher1 = await batching.newBatcher<string>(state.batcherId1, [], state.batcherOnFlush1)

      expect(state.batcher1).not.toBeUndefined()
      expect(state.batcher1.push).not.toBeUndefined()
      expect(state.batcher1.flush).not.toBeUndefined()
      expect(state.batcher1.id).toEqual(state.batcherId1)

      {
        state.batcher2 = await batching.newBatcher<string>(state.batcherId2, [state.batcher1!], state.batcherOnFlush2)

        expect(state.batcher2).not.toBeUndefined()
        expect(state.batcher2.push).not.toBeUndefined()
        expect(state.batcher2.flush).not.toBeUndefined()
        expect(state.batcher2.id).toEqual(state.batcherId2)
      }
    })

    test('Should be able to create immediate and delayed batchers', async () => {
      batching['enabled'] = false

      const id = 'immediate'
      await batching.newBatcher<string>(id, [], state.batcherOnFlush1)
      expect(batching['batchers'][id]).toBeInstanceOf(ImmediateBatcher)

      {
        batching['enabled'] = true

        const id = 'delayed'
        await batching.newBatcher<string>(id, [], state.batcherOnFlush1)
        expect(batching['batchers'][id]).toBeInstanceOf(DelayedBatcher)
      }
    })

    test('Should be able to override an existing batcher', async () => {
      const batcher = await batching.newBatcher<string>(state.batcherId1, [state.batcher2!], state.batcherOnFlush1)

      expect(state.batcher1).not.toEqual(batcher)
      expect(batching['batchers'][state.batcherId1]).toEqual(batcher)

      state.batcher1 = batching['batchers'][state.batcherId1]
    })

    test('Should not throw when onFlush raises an error', async () => {
      jest.useFakeTimers()

      await batching.newBatcher<string>('shouldNotThrow1', [], () => {
        throw new Error()
      })

      jest.advanceTimersByTime(20_000)
      jest.useRealTimers()

      {
        await batching.newBatcher<string>('shouldNotThrow2', [], () => {
          throw new Error()
        })

        await expect(batching.destroy()).resolves.not.toThrow()
      }
    })
  })
})
