import { MetaService } from '../../src'
import { ServerMetadata } from '../../src/meta/types'
import { setupApp, destroyApp, engine, DEFAULT_VERSION } from '../utils'

describe('BarrierService', () => {
  let meta: MetaService
  let state: {
    pkg: ServerMetadata
  }

  beforeAll(async () => {
    await setupApp()

    meta = engine.meta

    state = {
      pkg: {
        version: '0.0.1' // Should be different than the version set within setupApp()
      }
    }

    // Manually set the values to undefined so that we can work on the meta service
    // as if it wasn't already initialized
    meta['current'] = undefined
    ;(meta['pkg'] as any) = undefined
  })

  afterAll(async () => {
    await destroyApp()
  })

  describe('SetPkg', () => {
    test('Should be able to set the content of the service package.json into the meta service', async () => {
      expect(meta['pkg']).toBeUndefined()

      meta.setPkg(state.pkg)

      expect(meta['pkg']).toEqual(state.pkg)
    })
  })

  describe('App', () => {
    test('Should return the version of the application', async () => {
      expect(meta.app()).toEqual(state.pkg)
    })
  })

  describe('Get', () => {
    test('Should return undefined if the current version was never fetched', async () => {
      expect(meta.get()).toBeUndefined()
    })

    test('Should return the current version of the application', async () => {
      await meta.refresh()

      expect(meta.get()).toEqual({ version: DEFAULT_VERSION })
    })
  })

  describe('Update', () => {
    test('Should do nothing if trying to update to the same version', async () => {
      await meta.update({ version: DEFAULT_VERSION })

      expect(meta.get()).toEqual({ version: DEFAULT_VERSION })
    })

    test('Should be able to update the version stored in the database', async () => {
      await meta.update(state.pkg)

      expect(meta.get()).toEqual(state.pkg)
    })

    test('Should be able to update the version stored in the database using a transaction', async () => {
      const trx = await meta['db'].knex.transaction()
      await meta.update({ version: DEFAULT_VERSION }, trx)
      await trx.commit()

      expect(meta.get()).toEqual({ version: DEFAULT_VERSION })
    })
  })

  describe('Refresh', () => {
    test('Should set the current version of the application with the one stored in the database', async () => {
      await meta.refresh()

      expect(meta.get()).toEqual({ version: DEFAULT_VERSION })
    })
  })

  describe('Fetch', () => {
    test('Should fetch the current version of the application from the database', async () => {
      const entry = await meta.fetch()

      expect(entry).not.toBeUndefined()
      expect(meta.get()).toEqual({ version: entry!.data.version })
    })

    test('Should return undefined if no version was stored', async () => {
      await meta['query']().delete()

      const entry = await meta.fetch()

      expect(entry).toBeUndefined()

      await meta.update(state.pkg)
    })
  })
})
