import { LinkedQueue } from '../src/instances/queue'

describe('Linked Queue', () => {
  const state: { queue?: LinkedQueue<number>; value?: number } = {}

  beforeAll(async () => {})

  afterAll(async () => {})

  beforeEach(async () => {})

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

  test('Equeue and peek', async () => {
    state.value = 14
    state.queue!.enqueue(state.value)
    expect(state.queue!.count).toBe(1)
    expect(state.queue!.peek()).toBe(state.value)
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
})
