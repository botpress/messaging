import crypto from 'crypto'
import { ProviderService } from '../src/providers/service'
import { Provider } from '../src/providers/types'
import { getApp } from './util/app'

describe('Providers', () => {
  let providers: ProviderService
  const state: { provider?: Provider } = {}

  beforeAll(async () => {
    providers = (await getApp()).providers
  })

  afterAll(async () => {
    await (await getApp()).destroy()
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
  })

  test('Get provider by name', async () => {
    const provider = await providers.getByName(state.provider!.name)
    expect(provider).toEqual(state.provider)
  })

  test('Delete provider', async () => {
    await providers.delete(state.provider!.id)
  })

  test('Deleted provider cannot be fetched by id', async () => {
    const provider = await providers.getById(state.provider!.id)
    expect(provider).toBeUndefined()
  })

  test('Deleted provider cannot be fetched by name', async () => {
    const provider = await providers.getByName(state.provider!.name)
    expect(provider).toBeUndefined()
  })
})
