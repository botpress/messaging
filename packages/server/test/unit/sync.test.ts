import { DatabaseService } from '@botpress/messaging-engine'
import cloneDeep from 'lodash/cloneDeep'

import { ChannelService } from '../../src/channels/service'
import { makeSyncRequestSchema } from '../../src/sync/schema'

jest.mock('@botpress/messaging-engine')

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
    webhooks
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
      const { error, value } = schema.validate({ body: obj, params: {}, query: {} })
      if (error) {
        throw error
      }

      expect(value).toEqual({ body: obj, params: {}, query: {} })
    })

    test('Should not throw any error with an object that contains only valid properties', async () => {
      const schema = makeSyncRequestSchema(channelService.list())

      const { error, value } = schema.validate({ body: validObj, params: {}, query: {} })
      if (error) {
        throw error
      }

      expect(value).toEqual({ body: validObj, params: {}, query: {} })
    })

    test('Should strip unknown properties from object', async () => {
      const schema = makeSyncRequestSchema(channelService.list())

      const { error, value } = schema.validate({ body: validObjWithUnknownProperties, params: {}, query: {} })
      if (error) {
        throw error
      }

      expect(value).toEqual({ body: validObj, params: {}, query: {} })
    })

    test('Should only accept objects', async () => {
      const schema = makeSyncRequestSchema(channelService.list())

      const val = ''
      const { error, value } = schema.validate({ body: val, params: {}, query: {} })

      expect(error).not.toBeUndefined()
      expect(error!.message).toEqual('"body" must be of type object')
      expect(value).toEqual({ body: val, params: {}, query: {} })
    })

    test('Should only accept valid URI as webhook url', async () => {
      const schema = makeSyncRequestSchema(channelService.list())

      const { error, value } = schema.validate({ body: validObjWithInvalidWebhook, params: {}, query: {} })

      expect(error).not.toBeUndefined()
      expect(error!.message).toEqual('"body.webhooks[0].url" must be a valid uri')
      expect(value).toEqual({ body: validObjWithInvalidWebhook, params: {}, query: {} })
    })
  })
})
