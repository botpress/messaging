import { DatabaseService } from '@botpress/messaging-engine'
import cloneDeep from 'lodash/cloneDeep'

import { ChannelService } from '../../src/channels/service'
import { SyncApi } from '../../src/sync/api'

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

    test('Should strip unknown properties from legacy channels', async () => {
      const { error, value } = syncApi.validate({
        channels: { ...channels, telegram: { ...channels.telegram, randomProp: 'yoyo' } }
      })
      if (error) {
        throw error
      }

      expect(value).toEqual({ channels, webhooks: [] })
    })
  })
})
