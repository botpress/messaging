import { Barrier2D, BarrierService } from '../../src'
import { setupApp, destroyApp, engine } from '../utils'

describe('BarrierService', () => {
  let barriers: BarrierService
  let state: {
    barrier1?: Barrier2D<string>
    barrierId1: string

    barrier2?: Barrier2D<string>
    barrierId2: string
  }

  beforeAll(async () => {
    await setupApp()

    barriers = engine.barriers

    state = { barrierId1: 'id1', barrierId2: 'id2' }
  })

  afterAll(async () => {
    await destroyApp()
  })

  describe('NewBarrier2D', () => {
    test('Should be able to create barriers', async () => {
      state.barrier1 = await barriers.newBarrier2D(state.barrierId1)

      expect(state.barrier1).not.toBeUndefined()
      expect(state.barrier1.once).not.toBeUndefined()

      {
        state.barrier2 = await barriers.newBarrier2D(state.barrierId2)

        expect(state.barrier2).not.toBeUndefined()
        expect(state.barrier2.once).not.toBeUndefined()
      }
    })

    test('Should be able to create multiple barriers with the same id', async () => {
      const barrier = await barriers.newBarrier2D(state.barrierId1)

      expect(barrier).not.toBeUndefined()
      expect(barrier.once).not.toBeUndefined()

      expect(barrier['id']).toEqual(state.barrier1!['id'])
      expect(barrier['locks']['id']).toEqual(state.barrier1!['locks']['id'])
    })
  })
})
