import { ImmediateBatcher, DelayedBatcher } from '../../src/batching/batcher'

describe('Batcher', () => {
  describe('ImmediateBatcher', () => {
    const id = 'immediate_batcher_test'
    const items = [1, 2, 3, 4, 5, 6]
    type Item = typeof items[0]

    test('Should instantiate without throwing any error when given an id and a callback', () => {
      try {
        const batcher = new ImmediateBatcher(id, async () => {})

        expect(batcher.id).toEqual(id)
      } catch (e) {
        fail(e)
      }
    })

    describe('push', () => {
      test('Should call onFlush every time push is called', async () => {
        const onFlush = jest.fn().mockImplementation(async (_batch: Item) => {})
        const batcher = new ImmediateBatcher<Item>(id, onFlush)

        const item = items[0]
        await batcher.push(item)

        expect(onFlush).toHaveBeenCalledTimes(1)
        expect(onFlush).toHaveBeenCalledWith([item])
      })
    })
  })

  describe('DelayedBatcher', () => {
    const id = 'delayed_batcher_test'
    const items = [1, 2, 3, 4, 5, 6]
    const maxSize = items.length - 1
    type Item = typeof items[0]

    test('MaxSize should be a value higher than 1 and lower than items size', () => {
      expect(maxSize).toBeGreaterThan(1)
      expect(maxSize).toBeLessThan(items.length)
    })

    test('Should instantiate without throwing any error when given an id, empty dependencies, a max size, and a callback', () => {
      try {
        const batcher = new DelayedBatcher(id, [], maxSize, async () => {})

        expect(batcher.id).toEqual(id)
        expect(batcher['maxSize']).toEqual(maxSize)
      } catch (e) {
        fail(e)
      }
    })

    describe('push', () => {
      test('Should not call onFlush every time push is called', async () => {
        const onFlush = jest.fn().mockImplementation(async (_batch: Item) => {})
        const batcher = new DelayedBatcher<Item>(id, [], maxSize, onFlush)

        const item = items[0]
        await batcher.push(item)

        expect(batcher['batch']).toEqual([item])
        expect(onFlush).toHaveBeenCalledTimes(0)
      })

      test('Should not call onFlush if the number of items pushed is lower than maxSize', async () => {
        const onFlush = jest.fn().mockImplementation(async (_batch: Item) => {})
        const batcher = new DelayedBatcher<Item>(id, [], maxSize, onFlush)

        const itemsToPush = items.slice(0, maxSize)
        for (const item of itemsToPush) {
          await batcher.push(item)
        }

        expect(batcher['batch']).toEqual(itemsToPush)
        expect(onFlush).toHaveBeenCalledTimes(0)
      })

      test('Should call onFlush when the number of items pushed is greater than max size', async () => {
        const onFlush = jest.fn().mockImplementation(async (_batch: Item[]) => {})
        const batcher = new DelayedBatcher<Item>(id, [], maxSize, onFlush)

        for (const item of items) {
          await batcher.push(item)
        }

        expect(onFlush).toHaveBeenCalledTimes(1)
        expect(onFlush).toHaveBeenCalledWith(items.slice(0, maxSize))
        expect(batcher['batch']).toEqual(items.slice(maxSize, items.length))
      })

      test('Should also flush dependencies when the number of items pushed is greater than max size', async () => {
        const onFlushDependency = jest.fn().mockImplementation(async (_batch: Item[]) => {})
        const dependencyBatcher = new DelayedBatcher('dependency_batcher', [], maxSize, onFlushDependency)

        const onFlush = jest.fn().mockImplementation(async (_batch: Item[]) => {})
        const batcher = new DelayedBatcher<Item>(id, [dependencyBatcher], maxSize, onFlush)

        const itemsToPush = items.slice(0, maxSize)
        for (const item of itemsToPush) {
          await dependencyBatcher.push(item)
        }

        expect(onFlushDependency).toHaveBeenCalledTimes(0)
        expect(dependencyBatcher['batch']).toEqual(itemsToPush)

        for (const item of items) {
          await batcher.push(item)
        }

        expect(onFlush).toHaveBeenCalledTimes(1)
        expect(onFlush).toHaveBeenCalledWith(itemsToPush)
        expect(batcher['batch']).toEqual(items.slice(maxSize, items.length))

        expect(onFlushDependency).toHaveBeenCalledTimes(1)
        expect(onFlushDependency).toHaveBeenCalledWith(itemsToPush)
        expect(dependencyBatcher['batch']).toEqual([])
      })
    })

    describe('flush', () => {
      test('Should call onFlush even if the batch size is lower than maxSize', async () => {
        const onFlush = jest.fn().mockImplementation(async (_batch: Item) => {})
        const batcher = new DelayedBatcher<Item>(id, [], maxSize, onFlush)

        const item = items[0]
        await batcher.push(item)

        expect(batcher['batch']).toEqual([item])
        expect(onFlush).toHaveBeenCalledTimes(0)

        await batcher.flush()

        expect(batcher['batch']).toEqual([])
        expect(onFlush).toHaveBeenCalledTimes(1)
        expect(onFlush).toHaveBeenCalledWith([item])
      })

      test('Should do nothing if the batch is empty', async () => {
        const onFlush = jest.fn().mockImplementation(async (_batch: Item) => {})
        const batcher = new DelayedBatcher<Item>(id, [], maxSize, onFlush)

        expect(batcher['batch']).toEqual([])
        expect(onFlush).toHaveBeenCalledTimes(0)

        await batcher.flush()

        expect(batcher['batch']).toEqual([])
        expect(onFlush).toHaveBeenCalledTimes(0)
      })
    })
  })
})
