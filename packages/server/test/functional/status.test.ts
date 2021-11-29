import crypto from 'crypto'
import ms from 'ms'
import { validate as validateUuid } from 'uuid'
import { Conduit } from '../../src/conduits/types'
import { Provider } from '../../src/providers/types'
import { StatusService } from '../../src/status/service'
import { ConduitStatus } from '../../src/status/types'
import { app, setupApp } from './utils'

describe('Status', () => {
  let status: StatusService
  let state: {
    provider: Provider
    conduit: Conduit
    conduit2: Conduit
    status?: ConduitStatus
    status2?: ConduitStatus
  }

  beforeAll(async () => {
    await setupApp()

    const provider = await app.providers.create(crypto.randomBytes(20).toString('hex'), false)
    const channel = app.channels.getByName('twilio')
    const conduit = await app.conduits.create(provider.id, channel.id, { accountSID: 'abc', authToken: 'sds' })
    const channel2 = app.channels.getByName('slack')
    const conduit2 = await app.conduits.create(provider.id, channel2.id, { botToken: 'abc', signingSecret: 'sds' })

    status = app.status
    state = {
      provider,
      conduit,
      conduit2
    }
  })

  afterAll(async () => {
    await app.destroy()
  })

  beforeEach(async () => {
    app.caching.resetAll()
  })

  test('Get status of new conduit should be undefined', async () => {
    const st = await status.get(state.conduit.id)
    expect(st).toBeUndefined()
  })

  test('Create status', async () => {
    const st = await status.create(state.conduit.id)

    expect(validateUuid(st.conduitId)).toBeTruthy()
    expect(st.numberOfErrors).toBe(0)
    expect(st.initializedOn).toBeUndefined()
    expect(st.lastError).toBeUndefined()

    state.status = st
  })

  test('Get status', async () => {
    const st = await status.get(state.conduit.id)

    expect(st).toEqual(state.status)
  })

  test('List outdated should contain status', async () => {
    const outdateds = await status.listOutdated(ms('1h'), 10, 10)

    expect(outdateds).toEqual([state.status])
  })

  test('Create status again should fail', async () => {
    await expect(status.create(state.conduit.id)).rejects.toThrow()
  })

  test('Create status for other conduit', async () => {
    let st = await status.get(state.conduit2.id)
    expect(st).toBeUndefined()

    st = await status.create(state.conduit2.id)

    expect(validateUuid(st.conduitId)).toBeTruthy()
    expect(st.numberOfErrors).toBe(0)
    expect(st.initializedOn).toBeUndefined()
    expect(st.lastError).toBeUndefined()

    state.status2 = st
  })

  test('List outdated should contain both status', async () => {
    const outdateds = await status.listOutdated(ms('1h'), 10, 10)

    expect(outdateds).toEqual([state.status, state.status2])
  })
})
