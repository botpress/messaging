import cloneDeep from 'lodash/cloneDeep'

import { ChannelService } from '../src/channels/service'
import { DatabaseService } from '../src/database/service'
import { makeSyncRequestSchema } from '../src/sync/schema'

jest.mock('../src/database/service')

const channels = {
  messenger: {
    accessToken: 'accessToken',
    appSecret: 'appSecret',
    verifyToken: 'verifyToken'
  },
  slack: {
    signingSecret: 'signingSecret',
    useRTM: false,
    botToken: 'botToken'
  },
  smooch: {
    keyId: 'keyId',
    secret: 'secret',
    forwardRawPayloads: ['text']
  },
  teams: {
    appId: 'appId',
    appPassword: 'appPassword',
    proactiveMessages: {
      proactiveMessages: 'proactiveMessages'
    }
  },
  telegram: {
    botToken: 'botToken'
  },
  twilio: {
    accountSID: 'accountSID',
    authToken: 'authToken'
  },
  vonage: {
    useTestingApi: true,
    apiKey: 'apiKey',
    apiSecret: 'apiSecret',
    signatureSecret: 'signatureSecret',
    applicationId: 'applicationId',
    privateKey: 'privateKey'
  }
}
const webhooks = [
  {
    url: 'https://url.com'
  },
  {
    url: 'http://localhost:3100'
  }
]
const invalidWebhook = [
  {
    url: '83.23.12.1:3100'
  }
]

describe('Sync', () => {
  let channelService: ChannelService

  const validObj = {
    channels,
    webhooks,
    name: 'a test config',
    id: 'a5869bcf-fee3-45f4-b083-1d177ea0d9cc',
    token: 'Eg4NWrUhW8TEMrZ39Gc4Y+vs2tl0VYt0/PgL4yhCZx1r/5QP0RQ2hbg/bWsKSfdn4R4/pQcK9S9tMk5XDdzkAbsb'
  }
  const validObjWithUnknownProperties = {
    ...cloneDeep(validObj),
    unknownProperty: 'unknown'
  }
  const validObjWithInvalidWebhook = {
    ...cloneDeep(validObj),
    webhooks: invalidWebhook
  }

  beforeEach(() => {
    const databaseService = new DatabaseService()
    channelService = new ChannelService(databaseService)
  })

  describe('makeSyncRequestSchema', () => {
    test('Should not throw any error with all required fields', async () => {
      const schema = makeSyncRequestSchema(channelService.list())

      const obj = {}
      const { error, value } = schema.validate(obj)
      if (error) {
        throw error
      }

      expect(value).toEqual(obj)
    })

    test('Should not throw any error with an object that contains only valid properties', async () => {
      const schema = makeSyncRequestSchema(channelService.list())

      const { error, value } = schema.validate(validObj)
      if (error) {
        throw error
      }

      expect(value).toEqual(validObj)
    })

    test('Should strip unknown properties from object', async () => {
      const schema = makeSyncRequestSchema(channelService.list())

      const { error, value } = schema.validate(validObjWithUnknownProperties)
      if (error) {
        throw error
      }

      expect(value).toEqual(validObj)
    })

    test('Should only accept objects', async () => {
      const schema = makeSyncRequestSchema(channelService.list())

      const val = ''
      const { error, value } = schema.validate(val)

      expect(error).not.toBeUndefined()
      expect(error!.message).toEqual('"value" must be of type object')
      expect(value).toEqual(val)
    })

    test('Should only accept valid URI as webhook url', async () => {
      const schema = makeSyncRequestSchema(channelService.list())

      const { error, value } = schema.validate(validObjWithInvalidWebhook)

      expect(error).not.toBeUndefined()
      expect(error!.message).toEqual('"webhooks[0].url" must be a valid uri')
      expect(value).toEqual(validObjWithInvalidWebhook)
    })
  })
})
