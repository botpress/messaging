import { Channel } from '@botpress/messaging-channels'
import _ from 'lodash'
import { validate as validateUuid } from 'uuid'
import { ConduitService } from '../../src/conduits/service'
import { Conduit } from '../../src/conduits/types'
import { Provider } from '../../src/providers/types'
import { app, randStr, setupApp } from '../utils'

describe('Conduits', () => {
  let conduits: ConduitService
  let querySpy: jest.SpyInstance
  let state: { provider: Provider; channel: Channel; channelConfig: any; conduit?: Conduit }

  beforeAll(async () => {
    await setupApp()
    conduits = app.conduits
    querySpy = jest.spyOn(conduits as any, 'query')

    state = {
      provider: await app.providers.create(randStr(), false),
      channel: app.channels.getByNameAndVersion('telegram', '1.0.0'),
      channelConfig: { botToken: randStr() }
    }
  })

  afterAll(async () => {
    await app.destroy()
  })

  beforeEach(async () => {
    app.caching.resetAll()
  })

  test('Create conduit', async () => {
    const conduit = await conduits.create(state.provider.id, state.channel.meta.id, state.channelConfig)

    expect(conduit).toBeDefined()
    expect(validateUuid(conduit.id)).toBeTruthy()
    expect(conduit.channelId).toEqual(state.channel.meta.id)
    expect(conduit.providerId).toEqual(state.provider.id)
    expect(conduit.config).toEqual(state.channelConfig)

    state.conduit = conduit
    await app.instances.lifetimes.stop(conduit.id)
  })

  test('Creating same conduit throws', async () => {
    await expect(conduits.create(state.provider.id, state.channel.meta.id, state.channelConfig)).rejects.toThrow()
  })

  test('Creating conduit with invalid config throws', async () => {
    const otherProvider = await app.providers.create(randStr(), false)
    await expect(conduits.create(otherProvider.id, state.channel.meta.id, { yo: randStr() })).rejects.toThrow()
  })

  test('Get conduit by id', async () => {
    const conduit = await conduits.get(state.conduit!.id)
    expect(conduit).toEqual(state.conduit)
    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get conduit by id cached', async () => {
    const conduit = await conduits.get(state.conduit!.id)
    expect(conduit).toEqual(state.conduit)
    expect(querySpy).toHaveBeenCalledTimes(1)

    for (let i = 0; i < 10; i++) {
      const cached = await conduits.get(state.conduit!.id)
      expect(cached).toEqual(state.conduit)
    }

    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get conduit by provider and channel', async () => {
    const conduit = await conduits.getByProviderAndChannel(state.provider.id, state.channel.meta.id)
    expect(conduit).toEqual(state.conduit)
    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Get conduit by provider and channel cached', async () => {
    const conduit = await conduits.getByProviderAndChannel(state.provider.id, state.channel.meta.id)
    expect(conduit).toEqual(state.conduit)
    expect(querySpy).toHaveBeenCalledTimes(1)

    for (let i = 0; i < 10; i++) {
      const cached = await conduits.getByProviderAndChannel(state.provider.id, state.channel.meta.id)
      expect(cached).toEqual(state.conduit)
    }

    expect(querySpy).toHaveBeenCalledTimes(1)
  })

  test('Updating conduit config clears cache and persist changes', async () => {
    const newConfig = { botToken: randStr() }
    await conduits.updateConfig(state.conduit!.id, newConfig)

    const conduit = await conduits.get(state.conduit!.id)
    expect(conduit).toEqual({ ...state.conduit, config: newConfig })

    state.conduit = conduit
  })

  test('Updating conduit config to invalid format throws error', async () => {
    const newConfig = { yo: randStr() }
    await expect(conduits.updateConfig(state.conduit!.id, newConfig)).rejects.toThrow()
  })

  test('List conduits by provider', async () => {
    const conduit1 = await conduits.create(
      state.provider.id,
      app.channels.getByNameAndVersion('twilio', '1.0.0').meta.id,
      {
        accountSID: randStr(),
        authToken: randStr()
      }
    )
    const conduit2 = await conduits.create(
      state.provider.id,
      app.channels.getByNameAndVersion('teams', '1.0.0').meta.id,
      {
        appId: randStr(),
        appPassword: randStr()
      }
    )

    const otherProvider = await app.providers.create(randStr(), false)
    const conduit3 = await conduits.create(
      otherProvider.id,
      app.channels.getByNameAndVersion('slack', '1.0.0').meta.id,
      {
        botToken: randStr(),
        signingSecret: randStr()
      }
    )

    const list = _.orderBy(await conduits.listByProvider(state.provider.id), 'id')
    expect(list).toEqual(
      _.orderBy([_.omit(state.conduit, 'config'), _.omit(conduit1, 'config'), _.omit(conduit2, 'config')], 'id')
    )
  })

  test('List conduits by channel', async () => {
    const otherProvider1 = await app.providers.create(randStr(), false)
    const otherProvider2 = await app.providers.create(randStr(), false)

    const conduit1 = await conduits.create(otherProvider1.id, state.channel.meta.id, { botToken: randStr() })
    const conduit2 = await conduits.create(otherProvider2.id, state.channel.meta.id, { botToken: randStr() })

    const list = _.orderBy(await conduits.listByChannel(state.channel.meta.id), 'id')
    expect(list).toEqual(
      _.orderBy([_.omit(state.conduit, 'config'), _.omit(conduit1, 'config'), _.omit(conduit2, 'config')], 'id')
    )
  })

  test('Deleting conduit clears cache and persists in changes', async () => {
    await conduits.delete(state.conduit!.id)
    const calls = querySpy.mock.calls.length

    const notCachedById = await conduits.fetch(state.conduit!.id)
    expect(notCachedById).toBeUndefined()
    expect(querySpy).toHaveBeenCalledTimes(calls + 1)

    const notCachedByProviderAndChannel = await conduits.fetchByProviderAndChannel(
      state.provider.id,
      state.channel.meta.id
    )
    expect(notCachedByProviderAndChannel).toBeUndefined()
    expect(querySpy).toHaveBeenCalledTimes(calls + 2)
  })
})
