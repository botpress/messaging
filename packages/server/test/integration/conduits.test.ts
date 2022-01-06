import { Channel } from '@botpress/messaging-channels'
import crypto from 'crypto'
import _ from 'lodash'
import { validate as validateUuid } from 'uuid'
import { ConduitService } from '../../src/conduits/service'
import { Conduit } from '../../src/conduits/types'
import { Provider } from '../../src/providers/types'
import { app, setupApp } from './utils'

describe('Conduits', () => {
  let conduits: ConduitService
  let querySpy: jest.SpyInstance
  let state: { provider: Provider; channel: Channel; channelConfig: any; conduit?: Conduit }

  beforeAll(async () => {
    await setupApp()
    conduits = app.conduits
    querySpy = jest.spyOn(conduits, 'query')

    state = {
      provider: await app.providers.create(crypto.randomBytes(20).toString('hex'), false),
      channel: app.channels.getByName('telegram'),
      channelConfig: { botToken: 'blabla' }
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
    const newConfig = { botToken: 'MELLON' }
    await conduits.updateConfig(state.conduit!.id, newConfig)
    const calls = querySpy.mock.calls.length

    const conduit = await conduits.get(state.conduit!.id)
    expect(conduit).toEqual({ ...state.conduit, config: newConfig })
    // TODO: doesn't work because this is reacted to in an event. Should events be disabled in tests?
    // expect(querySpy).toHaveBeenCalledTimes(calls + 1)

    state.conduit = conduit
  })

  test('List conduits by provider', async () => {
    const conduit1 = await conduits.create(state.provider.id, app.channels.getByName('twilio').meta.id, {
      accountSID: 'fdf',
      authToken: 'sdsdsdsd'
    })
    const conduit2 = await conduits.create(state.provider.id, app.channels.getByName('teams').meta.id, {
      appId: 'dsdsd',
      appPassword: 'dfdfdf'
    })

    const otherProvider = await app.providers.create('yaayaya', false)
    const conduit3 = await conduits.create(otherProvider.id, app.channels.getByName('slack').meta.id, {
      botToken: 'sdsdsd',
      signingSecret: 'sdsdsd',
      useRTM: false
    })

    const list = _.orderBy(await conduits.listByProvider(state.provider.id), 'id')
    expect(list).toEqual(
      _.orderBy([_.omit(state.conduit, 'config'), _.omit(conduit1, 'config'), _.omit(conduit2, 'config')], 'id')
    )
  })

  test('List conduits by channel', async () => {
    const otherProvider1 = await app.providers.create('fdfdfd', false)
    const otherProvider2 = await app.providers.create('adsfsgsfg', false)

    const conduit1 = await conduits.create(otherProvider1.id, state.channel.meta.id, { botToken: 'eyoyo' })
    const conduit2 = await conduits.create(otherProvider2.id, state.channel.meta.id, { botToken: 'sdsdsds' })

    const list = _.orderBy(await conduits.listByChannel(state.channel.meta.id), 'id')
    expect(list).toEqual(
      _.orderBy([_.omit(state.conduit, 'config'), _.omit(conduit1, 'config'), _.omit(conduit2, 'config')], 'id')
    )
  })
})
