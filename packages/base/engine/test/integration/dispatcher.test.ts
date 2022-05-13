import { Dispatcher, DispatchService } from '../../src'
import { setupApp, destroyApp, engine } from '../utils'

enum TestDispatches {
  Test
}

class TestDispatcher extends Dispatcher<{
  [TestDispatches.Test]: any
}> {}

describe('DispatcherService', () => {
  let dispatches: DispatchService

  beforeAll(async () => {
    await setupApp()

    dispatches = engine.dispatches
  })

  afterAll(async () => {
    await destroyApp()
  })

  beforeEach(async () => {
    engine.caching.resetAll()
  })

  describe('Create', () => {
    test('Should be able to create a new dispatcher', async () => {
      const dispatcher = await dispatches.create('test', TestDispatcher)

      expect(dispatcher).toBeDefined()
      expect(dispatcher.on).toBeDefined()
    })
  })
})
