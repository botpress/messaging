import crypto from 'crypto'
import { Conduit } from '../../src/conduits/types'
import { Provider } from '../../src/providers/types'
import { StatusService } from '../../src/status/service'
import { app, setupApp } from './utils'

describe('Status', () => {
  let status: StatusService
  let state: { provider: Provider; conduit: Conduit }

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

  test('Get number of errors of new conduit should be undefined', async () => {
    const errors = await status.getNumberOfErrors(state.conduit.id)
    expect(errors).toBeUndefined()
  })
})
