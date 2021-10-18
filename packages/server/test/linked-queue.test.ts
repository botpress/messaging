import { LinkedQueue } from '../src/instances/queue'

describe('Linked Queue', () => {
  const state: { queue?: LinkedQueue<number> } = {}

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

  test('Equeue and peek', async () => {
    const value = 14
    state.queue!.enqueue(value)
    expect(state.queue!.peek()).toBe(value)
  })
})
