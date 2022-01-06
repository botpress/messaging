import { Channel } from '@botpress/messaging-channels'
import crypto from 'crypto'
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
})
