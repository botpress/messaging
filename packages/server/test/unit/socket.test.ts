import { userDataSchema, parseUserData } from '../../src/socket/manager'

describe('parse userData', () => {
  test('parseUserData', async () => {
    expect(parseUserData(undefined)).toBeUndefined()
    expect(parseUserData([''])).toBeUndefined()
    expect(parseUserData(['adfasd'])).toBeUndefined()
    expect(parseUserData([])).toBeUndefined()
    expect(parseUserData([JSON.stringify({ a: '1' })])).toEqual({ a: '1' })
    expect(parseUserData([JSON.stringify({ a: '1' }), JSON.stringify({ a: '2' })])).toEqual({ a: '1' })
    expect(parseUserData(JSON.stringify({ a: '1' }))).toEqual({ a: '1' })
    expect(parseUserData(JSON.stringify({ a: '1', b: '2' }))).toEqual({ a: '1', b: '2' })
  })

  test('userDataSchema', async () => {
    expect(userDataSchema.validate({ a: 1 }).error).toBeDefined()
    expect(userDataSchema.validate({ a: '1' }).error).not.toBeDefined()
    expect(userDataSchema.validate({ a: '1', b: 1 }).error).toBeDefined()
    expect(userDataSchema.validate({ a: '1', b: '1' }).error).not.toBeDefined()
  })
})
