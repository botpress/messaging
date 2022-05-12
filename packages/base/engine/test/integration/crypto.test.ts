import { CryptoService } from '../../src'
import { setupApp, destroyApp, engine } from '../utils'

describe('CryptoService', () => {
  let crypto: CryptoService
  let state: {
    encrypted1?: string
    hash1?: string
    decrypted1: string

    encrypted2?: string
    hash2?: string
    decrypted2: string
  }

  beforeAll(async () => {
    await setupApp()

    crypto = engine.crypto

    state = { decrypted1: 'this is a decrypted string', decrypted2: '' }
  })

  afterAll(async () => {
    await destroyApp()
  })

  beforeEach(async () => {
    engine.caching.resetAll()
  })

  describe('Encrypt', () => {
    test('Should be able to encrypt a string', async () => {
      state.encrypted1 = crypto.encrypt(state.decrypted1)

      expect(state.encrypted1).not.toEqual(state.decrypted1)
    })

    test('Should be able to encrypt an empty string', async () => {
      state.encrypted2 = crypto.encrypt(state.decrypted2)

      expect(state.encrypted2).not.toBeUndefined()
      expect(state.encrypted2).not.toEqual(state.decrypted2)
    })

    test('Should not encrypt the string if the encryption key is empty', async () => {
      const key = crypto['key']
      ;(crypto['key'] as any) = undefined

      const encrypted = crypto.encrypt(state.decrypted1)

      expect(encrypted).toEqual(state.decrypted1)

      crypto['key'] = key
    })
  })

  describe('Decrypt', () => {
    test('Should be able to decrypt a string', async () => {
      const decrypted = crypto.decrypt(state.encrypted1!)

      expect(decrypted).toEqual(state.decrypted1)
    })

    test('Should be able to decrypt an empty string', async () => {
      const decrypted = crypto.decrypt(state.encrypted2!)

      expect(decrypted).toEqual(state.decrypted2)
    })

    test('Should not be able to decrypt an un-encrypted string', async () => {
      expect(() =>
        crypto.decrypt(`${Buffer.from('iv').toString('base64')}$${Buffer.from(state.decrypted1).toString('base64')}`)
      ).toThrow('Invalid initialization vector')
    })

    test('Should not decrypt the string if the encryption key is empty', async () => {
      const key = crypto['key']
      ;(crypto['key'] as any) = undefined

      const decrypted = crypto.decrypt(state.encrypted1!)

      expect(decrypted).toEqual(state.encrypted1!)

      crypto['key'] = key
    })
  })

  describe('Hash', () => {
    test('Should be able to hash a string', async () => {
      state.hash1 = await crypto.hash(state.decrypted1)

      expect(state.hash1).not.toEqual(state.decrypted1)
    })

    test('Should be able to hash an empty string', async () => {
      state.hash2 = await crypto.hash(state.decrypted2)

      expect(state.hash2).not.toEqual(state.decrypted2)
    })
  })

  describe('CompareHash', () => {
    test('Should be able to compare hash strings', async () => {
      const compare = await crypto.compareHash(state.hash1!, state.decrypted1)

      expect(compare).toEqual(true)

      {
        const compare = await crypto.compareHash(state.hash2!, state.decrypted2)

        expect(compare).toEqual(true)
      }
    })

    test('Should return false if the string and the hash do not match', async () => {
      const compare = await crypto.compareHash(state.hash2!, state.decrypted1)

      expect(compare).toEqual(false)

      {
        const compare = await crypto.compareHash(state.hash1!, state.decrypted2)

        expect(compare).toEqual(false)
      }
    })
  })
})
