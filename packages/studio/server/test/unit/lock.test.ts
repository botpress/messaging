import { Locker } from '../../src/studio/nlu/nlu-client/cloud/lock'

describe('getLock', () => {
  it('should never release a lock', async () => {
    const fn = jest.fn()

    const lock = Locker()
    void lock('key')
    void lock('key').then(() => {
      fn()
    })

    await new Promise((r) => setTimeout(r, 100))

    expect(fn).not.toHaveBeenCalled()
  })

  it('should wait for lock before updating value', async () => {
    const lock = Locker()

    let value = ''

    void lock('key').then((unlock) =>
      setTimeout(() => {
        value = 'unexpected'
        unlock()
      }, 100)
    )

    expect(value).toEqual('')

    await lock('key')

    expect(value).toEqual('unexpected')
    value = 'expected'
    expect(value).toEqual('expected')

    await new Promise((resolve) => {
      setTimeout(() => {
        expect(value).toEqual('expected')
        resolve(undefined)
      }, 200)
    })
  })
})
