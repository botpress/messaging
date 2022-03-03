import _ from 'lodash'
import ms from 'ms'
import { validate as validateUuid } from 'uuid'
import { Conduit } from '../../src/conduits/types'
import { Provider } from '../../src/providers/types'
import { StatusService } from '../../src/status/service'
import { ConduitStatus } from '../../src/status/types'
import { app, randStr, setupApp } from '../utils'

const TOLERANCE = ms('1h')
const LIMIT = 10
const MAX_ERRORS = 5

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

    const provider = await app.providers.create(randStr(), false)
    const channel = app.channels.getByNameAndVersion('twilio', '1.0.0')
    const conduit = await app.conduits.create(provider.id, channel.meta.id, { accountSID: 'abc', authToken: 'sds' })
    const channel2 = app.channels.getByNameAndVersion('slack', '1.0.0')
    const conduit2 = await app.conduits.create(provider.id, channel2.meta.id, { botToken: 'abc', signingSecret: 'sds' })

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
    const st = await status.fetch(state.conduit.id)
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
    const st = await status.fetch(state.conduit.id)

    expect(st).toEqual(state.status)
  })

  test('List outdated should contain status', async () => {
    const outdateds = await status.listOutdated(TOLERANCE, MAX_ERRORS, LIMIT)

    expect(outdateds).toEqual([state.status])
  })

  test('Create status again should fail', async () => {
    await expect(status.create(state.conduit.id)).rejects.toThrow()
  })

  test('Create status for other conduit', async () => {
    let st = await status.fetch(state.conduit2.id)
    expect(st).toBeUndefined()

    st = await status.create(state.conduit2.id)

    expect(validateUuid(st.conduitId)).toBeTruthy()
    expect(st.numberOfErrors).toBe(0)
    expect(st.initializedOn).toBeUndefined()
    expect(st.lastError).toBeUndefined()

    state.status2 = st
  })

  test('List outdated should contain both status', async () => {
    const outdateds = await status.listOutdated(TOLERANCE, MAX_ERRORS, LIMIT)

    expect(outdateds).toEqual([state.status, state.status2])
  })

  test('Add error', async () => {
    const errMessage = 'err1'
    await status.addError(state.conduit.id, new Error(errMessage))

    const st = await status.fetch(state.conduit.id)
    expect(st!.numberOfErrors).toBe(1)
    expect(st!.lastError?.includes(errMessage)).toBeTruthy()

    state.status = st
  })

  test('Add another error', async () => {
    const errMessage = 'err2'
    await status.addError(state.conduit.id, new Error(errMessage))

    const st = await status.fetch(state.conduit.id)
    expect(st!.numberOfErrors).toBe(2)
    expect(st!.lastError?.includes(errMessage)).toBeTruthy()

    state.status = st
  })

  test('Add multiple errors', async () => {
    await status.addError(state.conduit.id, new Error('err3'))
    await status.addError(state.conduit.id, new Error('err4'))
    const errMessage = 'err5'
    await status.addError(state.conduit.id, new Error(errMessage))

    const st = await status.fetch(state.conduit.id)
    expect(st!.numberOfErrors).toBe(MAX_ERRORS)
    expect(st!.lastError?.includes(errMessage)).toBeTruthy()

    state.status = st
  })

  test('List outdated should not contain errored conduit', async () => {
    // conduit currently has 5 registered errors so it should no be listed
    const outdateds = await status.listOutdated(TOLERANCE, MAX_ERRORS, LIMIT)

    expect(outdateds).toEqual([state.status2])
  })

  test('List outdated should contain both conduits if max allowed errors is higher', async () => {
    const outdateds = await status.listOutdated(TOLERANCE, MAX_ERRORS + 1, LIMIT)

    expect(outdateds).toEqual([state.status2, _.omit(state.status, 'lastError')])
  })

  test('Clear errors', async () => {
    await status.clearErrors(state.conduit.id)

    const st = await status.fetch(state.conduit.id)
    expect(st!.numberOfErrors).toBe(0)
    expect(st!.lastError).toBeUndefined()

    state.status = st
  })

  test('List outdated should contain both conduits since errors have been cleaned', async () => {
    const outdateds = await status.listOutdated(TOLERANCE, MAX_ERRORS, LIMIT)

    expect(new Set(outdateds)).toEqual(new Set([state.status, state.status2]))
  })

  test('Update intializedOn', async () => {
    const date = new Date()
    await status.updateInitializedOn(state.conduit.id, date)

    const st = await status.fetch(state.conduit.id)
    expect(st!.initializedOn).toEqual(date)

    state.status = st
  })

  test('List outdated should not contain initialized conduit', async () => {
    const outdateds = await status.listOutdated(TOLERANCE, MAX_ERRORS, LIMIT)

    expect(outdateds).toEqual([state.status2])
  })

  test('List outdated should contain initialized conduit if the tolerance is very low', async () => {
    const outdateds = await status.listOutdated(0, MAX_ERRORS, LIMIT)

    expect(new Set(outdateds)).toEqual(new Set([state.status2, state.status]))
  })

  test('Update intializedOn for second conduit', async () => {
    const date = new Date()
    await status.updateInitializedOn(state.conduit2.id, date)

    const st = await status.fetch(state.conduit2.id)
    expect(st!.initializedOn).toEqual(date)

    state.status2 = st
  })

  test('List outdated should not contain both initialized conduits', async () => {
    const outdateds = await status.listOutdated(TOLERANCE, MAX_ERRORS, LIMIT)

    expect(outdateds.length).toEqual(0)
  })

  test('List outdated should contain both initialized conduits if the tolerance is very low', async () => {
    const outdateds = await status.listOutdated(0, MAX_ERRORS, LIMIT)

    expect(new Set(outdateds)).toEqual(new Set([state.status, state.status2]))
  })

  test('Set intializedOn to null', async () => {
    await status.updateInitializedOn(state.conduit.id, undefined)

    const st = await status.fetch(state.conduit.id)
    expect(st!.initializedOn).toBeUndefined()

    state.status = st
  })

  test('List outdated should include the uninitialized conduit again', async () => {
    const outdateds = await status.listOutdated(TOLERANCE, MAX_ERRORS, LIMIT)

    expect(outdateds).toEqual([state.status])
  })

  test('List outdated should respect the provided limit', async () => {
    const outdateds1 = await status.listOutdated(0, MAX_ERRORS, LIMIT)
    expect(outdateds1.length).toEqual(2)

    const outdateds2 = await status.listOutdated(0, MAX_ERRORS, 1)
    expect(outdateds2.length).toEqual(1)
  })
})
