import crypto from 'crypto'
import { validate as validateUuid } from 'uuid'
import { Conduit } from '../../src/conduits/types'
import { Provider } from '../../src/providers/types'
import { StatusService } from '../../src/status/service'
import { ConduitStatus } from '../../src/status/types'
import { app, setupApp } from './utils'

describe('Status', () => {
  let status: StatusService
  let state: { provider: Provider; conduit: Conduit; status?: ConduitStatus }

  beforeAll(async () => {
    await setupApp()

    const provider = await app.providers.create(crypto.randomBytes(20).toString('hex'), false)
    const channel = app.channels.getByName('twilio')
    const conduit = await app.conduits.create(provider.id, channel.id, { accountSID: 'abc', authToken: 'sds' })

    status = app.status
    state = {
      provider,
      conduit
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
})
