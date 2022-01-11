import { LinkedQueue } from '../../src/instances/messaging/queue'

const QUEUE_COUNT = 20
const QUEUE_VALUE_OFFSET = 100

describe('Linked Queue', () => {
  const state: { queue?: LinkedQueue<number>; value?: number } = {}

  test('Create linked queue', async () => {
    const queue = new LinkedQueue<number>()
    expect(queue.count).toBe(0)
    expect(queue.empty()).toBeTruthy()

    state.queue = queue
  })

  test('Dequeue when empty should throw error', async () => {
    expect(() => {
      state.queue!.dequeue()
    }).toThrow()
  })

  test('Peek when empty should throw error', async () => {
    expect(() => {
      state.queue!.peek()
    }).toThrow()
  })

  test('Equeue', async () => {
    state.value = 14
    state.queue!.enqueue(state.value)
    expect(state.queue!.count).toBe(1)
  })

  test('Peek should return correct value', async () => {
    const value = state.queue!.peek()
    expect(value).toBe(state.value)
    expect(state.queue!.count).toBe(1)
  })

  test('Dequeue should return correct value', async () => {
    const value = state.queue!.dequeue()
    expect(value).toBe(state.value)
    expect(state.queue!.count).toBe(0)
  })

  test('Equeue many', async () => {
    for (let i = 0; i < QUEUE_COUNT; i++) {
      state.queue?.enqueue(i + QUEUE_VALUE_OFFSET)
      expect(state.queue!.count).toBe(i + 1)
    }

    expect(state.queue!.count).toBe(20)
  })

  test('Dequeue many', async () => {
    for (let i = 0; i < QUEUE_COUNT; i++) {
      const value = state.queue?.dequeue()
      expect(value).toBe(i + QUEUE_VALUE_OFFSET)
      expect(state.queue!.count).toBe(QUEUE_COUNT - i - 1)
    }

    expect(state.queue!.count).toBe(0)
  })

  test('Equeue many and dequeue half', async () => {
    for (let i = 0; i < QUEUE_COUNT; i++) {
      state.queue?.enqueue(i + QUEUE_VALUE_OFFSET)
      expect(state.queue!.count).toBe(i + 1)
    }

    expect(state.queue!.count).toBe(20)

    for (let i = 0; i < QUEUE_COUNT / 2; i++) {
      const value = state.queue?.dequeue()
      expect(value).toBe(i + QUEUE_VALUE_OFFSET)
      expect(state.queue!.count).toBe(QUEUE_COUNT - i - 1)
    }

    expect(state.queue!.count).toBe(QUEUE_COUNT / 2)
  })
})
