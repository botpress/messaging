import { RuntimeConfig } from './runtime.config'

export const DefaultRuntimeConfig: Partial<RuntimeConfig> = {
  httpServer: {
    host: 'localhost',
    port: 3000,
    backlog: 0,
    bodyLimit: '10mb',
    cors: {
      enabled: true
    },
    externalUrl: '',
    rateLimit: {
      enabled: false,
      limitWindow: '30s',
      limit: 600
    },
    headers: {
      'X-Powered-By': 'Botpress'
    }
  },
  dialog: {
    janitorInterval: '10s',
    timeoutInterval: '2m',
    sessionTimeoutInterval: '30m'
  },
  logs: {
    dbOutput: {
      expiration: '2 weeks',
      janitorInterval: '30s'
    },
    fileOutput: {
      enabled: false,
      folder: './',
      maxFileSize: 10000
    }
  },
  sendUsageStats: true,
  dataRetention: {
    janitorInterval: '10m',
    policies: {}
  },
  eventCollector: {
    enabled: true,
    collectionInterval: '1s',
    retentionPeriod: '30d',
    ignoredEventTypes: ['visit', 'typing'],
    ignoredEventProperties: [],
    debuggerProperties: [
      'ndu.triggers',
      'ndu.predictions',
      'nlu.predictions',
      'state',
      'processing',
      'activeProcessing'
    ]
  },
  botMonitoring: {
    enabled: true,
    interval: '1m'
  },
  noRepeatPolicy: false,
  telemetry: {
    entriesLimit: 1000
  },
  nlu: {}
}
