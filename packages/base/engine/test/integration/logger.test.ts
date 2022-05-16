import { LoggerService } from '../../src'
import { setupApp, destroyApp, engine } from '../utils'

describe('BarrierService', () => {
  let logger: LoggerService

  beforeAll(async () => {
    await setupApp()

    logger = engine.logger
  })

  afterAll(async () => {
    await destroyApp()
  })

  describe('Constructor', () => {
    test('Should be able to create barriers', async () => {
      expect(logger.root).toBeDefined()
      expect(logger.root.info).toBeDefined()
      expect(logger.root.debug).toBeDefined()
      expect(logger.root.error).toBeDefined()
      expect(logger.root.prefix).toBeDefined()
      expect(logger.root.critical).toBeDefined()
      expect(logger.root.sub).toBeDefined()
      expect(logger.root.warn).toBeDefined()
      expect(logger.root.window).toBeDefined()
    })
  })
})
