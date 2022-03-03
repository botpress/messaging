import { validate as validateUuid } from 'uuid'
import { ProviderService } from '../../src/providers/service'
import { Provider } from '../../src/providers/types'
import { app, randStr, setupApp } from '../utils'

describe('Providers', () => {
  let providers: ProviderService
  let querySpy: jest.SpyInstance
  const state: { provider?: Provider } = {}

  beforeAll(async () => {
    await setupApp()
    providers = app.providers
    querySpy = jest.spyOn(providers as any, 'query')
  })

  afterAll(async () => {
    await app.destroy()
  })

  beforeEach(async () => {
    app.caching.resetAll()
  })

  test('Create provider', async () => {
    const name = randStr()
    const provider = await providers.create(name, false)

    expect(provider).toBeDefined()
    expect(validateUuid(provider.id)).toBeTruthy()
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

  test('Cache for getById is also set by calling getByName', async () => {
    const notCached = await providers.getByName(state.provider!.name)
    expect(notCached).toEqual(state.provider)
    expect(querySpy).toHaveBeenCalledTimes(1)

    const cached = await providers.getById(state.provider!.id)
    expect(cached).toEqual(state.provider)
    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Cache for getByName is also set by calling getById', async () => {
    const notCached = await providers.getById(state.provider!.id)
    expect(notCached).toEqual(state.provider)
    expect(querySpy).toHaveBeenCalledTimes(1)

    const cached = await providers.getByName(state.provider!.name)
    expect(cached).toEqual(state.provider)
    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Updating provider sandbox clears cache and persists changes', async () => {
    await providers.updateSandbox(state.provider!.id, true)
    const calls = querySpy.mock.calls.length

    const provider = await providers.getById(state.provider!.id)
    expect(provider).toEqual({ ...state.provider, sandbox: true })
    expect(querySpy).toHaveBeenCalledTimes(calls + 1)

    state.provider = provider
  })

  test('Updating provider name clears cache and persists changes', async () => {
    const newName = randStr()
    await providers.updateName(state.provider!.id, newName)
    const calls = querySpy.mock.calls.length

    const provider = await providers.getById(state.provider!.id)
    expect(provider).toEqual({ ...state.provider, name: newName })
    expect(querySpy).toHaveBeenCalledTimes(calls + 1)

    state.provider = provider
  })

  test('Deleting provider clears cache and persists in changes', async () => {
    await providers.delete(state.provider!.id)
    const calls = querySpy.mock.calls.length

    const notCachedById = await providers.fetchById(state.provider!.id)
    expect(notCachedById).toBeUndefined()
    expect(querySpy).toHaveBeenCalledTimes(calls + 1)

    const notCachedByName = await providers.fetchByName(state.provider!.name)
    expect(notCachedByName).toBeUndefined()
    expect(querySpy).toHaveBeenCalledTimes(calls + 2)
  })
})
