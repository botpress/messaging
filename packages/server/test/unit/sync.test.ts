import { ChannelService } from '../../src/channels/service'
import { SyncApi } from '../../src/sync/api'

jest.mock('@botpress/messaging-engine')

const channels = {
  messenger: {
    version: '1.0.0',
    appId: 'appId',
    appSecret: 'appSecret',
    verifyToken: 'verifyToken',
    pageId: 'pageId',
    accessToken: 'accessToken'
  },
  slack: {
    version: '1.0.0',
    signingSecret: 'signingSecret',
    botToken: 'botToken'
  },
  smooch: {
    version: '1.0.0',
    appId: 'appId',
    keyId: 'keyId',
    keySecret: 'keySecret',
    webhookSecret: 'webhookSecret'
  },
  teams: {
    version: '1.0.0',
    appId: 'appId',
    appPassword: 'appPassword'
  },
  telegram: {
    version: '1.0.0',
    botToken: 'botToken'
  },
  twilio: {
    version: '1.0.0',
    accountSID: 'accountSID',
    authToken: 'authToken'
  },
  vonage: {
    version: '1.0.0',
    apiKey: 'apiKey',
    apiSecret: 'apiSecret',
    signatureSecret: 'signatureSecret',
    useTestingApi: true
  }
}

describe('Sync', () => {
  let syncApi: SyncApi

  beforeEach(() => {
    const channelService = new ChannelService(undefined as any)
    syncApi = new SyncApi(undefined as any, channelService)
  })

  describe('Validation', () => {
    test('Should not throw any error with no channel', async () => {
      const { error, value } = syncApi.validate({})
      if (error) {
        throw error
      }

      expect(value).toEqual({ channels: {}, webhooks: [] })
    })

    test('Should not throw any error with every channel configured correctly', async () => {
      const { error, value } = syncApi.validate({ channels })
      if (error) {
        throw error
      }

      expect(value).toEqual({ channels, webhooks: [] })
    })
  })
})
