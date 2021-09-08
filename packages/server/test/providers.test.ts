import crypto from 'crypto'
import { ProviderService } from '../src/providers/service'
import { Provider } from '../src/providers/types'
import { setupApp, app } from './util/app'

describe('Providers', () => {
  let providers: ProviderService
  let querySpy: jest.SpyInstance
  const state: { provider?: Provider } = {}

  beforeAll(async () => {
    await setupApp()
    providers = app.providers
    querySpy = jest.spyOn(providers, 'query')
  })

  afterAll(async () => {
    await app.destroy()
  })

  beforeEach(async () => {
    app.caching.resetAll()
  })

  test('Create provider', async () => {
    const name = crypto.randomBytes(66).toString('base64')
    const provider = await providers.create(name, false)

    expect(provider).toBeDefined()
    expect(provider.name).toBe(name)
    expect(provider.sandbox).toBeFalsy()

    state.provider = provider
  })

  test('Get provider by id', async () => {
    const provider = await providers.getById(state.provider!.id)
    expect(provider).toEqual(state.provider)
    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get provider by id cached', async () => {
    const notCached = await providers.getById(state.provider!.id)
    expect(notCached).toEqual(state.provider)
    expect(querySpy).toHaveBeenCalledTimes(1)

    for (let i = 0; i < 10; i++) {
      const cached = await providers.getById(state.provider!.id)
      expect(cached).toEqual(state.provider)
    }

    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get provider by name', async () => {
    const provider = await providers.getByName(state.provider!.name)
    expect(provider).toEqual(state.provider)
    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get provider by name cached', async () => {
    const notCached = await providers.getByName(state.provider!.name)
    expect(notCached).toEqual(state.provider)
    expect(querySpy).toHaveBeenCalledTimes(1)

    for (let i = 0; i < 10; i++) {
      const cached = await providers.getByName(state.provider!.name)
      expect(cached).toEqual(state.provider)
    }

    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Delete provider', async () => {
    await providers.delete(state.provider!.id)
  })

  test('Deleted provider cannot be fetched by id', async () => {
    const provider = await providers.getById(state.provider!.id)
    expect(provider).toBeUndefined()
    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Deleted provider cannot be fetched by name', async () => {
    const provider = await providers.getByName(state.provider!.name)
    expect(provider).toBeUndefined()
    expect(querySpy).toHaveBeenCalledTimes(1)
  })
})
