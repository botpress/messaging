import { Client } from '../../src/clients/types'
import { Provider } from '../../src/providers/types'
import { ProvisionService } from '../../src/provisions/service'
import { Provision } from '../../src/provisions/types'
import { app, randStr, setupApp } from '../utils'

describe('Provisions', () => {
  let provisions: ProvisionService
  let querySpy: jest.SpyInstance
  let state: { client: Client; provider: Provider; provision?: Provision }

  beforeAll(async () => {
    await setupApp()
    provisions = app.provisions
    querySpy = jest.spyOn(provisions as any, 'query')

    state = {
      client: await app.clients.create(),
      provider: await app.providers.create(randStr(), false)
    }
  })

  afterAll(async () => {
    await app.destroy()
  })

  beforeEach(async () => {
    app.caching.resetAll()
  })

  test('Get provision that does not exist by client id', async () => {
    const provision = await provisions.fetchByClientId(state.client.id)
    expect(provision).toEqual(undefined)
    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get provision that does not exist by provider id', async () => {
    const provision = await provisions.fetchByProviderId(state.provider.id)
    expect(provision).toEqual(undefined)
    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Create provision', async () => {
    const provision = await provisions.create(state.client.id, state.provider.id)

    expect(provision).toBeDefined()
    expect(provision.clientId).toEqual(state.client.id)
    expect(provision.providerId).toEqual(state.provider.id)

    state.provision = provision
  })

  test('Get provision by client id', async () => {
    const provision = await provisions.getByClientId(state.client.id)
    expect(provision).toEqual(state.provision)
    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get provision by client id cached', async () => {
    const provision = await provisions.getByClientId(state.client.id)
    expect(provision).toEqual(state.provision)
    expect(querySpy).toHaveBeenCalledTimes(1)

    for (let i = 0; i < 10; i++) {
      const cached = await provisions.getByClientId(state.client.id)
      expect(cached).toEqual(state.provision)
    }

    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get provision by provider id', async () => {
    const provision = await provisions.getByProviderId(state.provider.id)
    expect(provision).toEqual(state.provision)
    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get provision by provider id cached', async () => {
    const provision = await provisions.getByProviderId(state.provider.id)
    expect(provision).toEqual(state.provision)
    expect(querySpy).toHaveBeenCalledTimes(1)

    for (let i = 0; i < 10; i++) {
      const cached = await provisions.getByProviderId(state.provider.id)
      expect(cached).toEqual(state.provision)
    }

    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Delete provision', async () => {
    const result = await provisions.delete(state.client.id)
    expect(result).toEqual(true)
  })

  test('Delete provision that does not exist throws', async () => {
    await expect(provisions.delete(state.client.id)).rejects.toThrow()
  })
})
