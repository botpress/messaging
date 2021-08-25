export interface MessagingEnv {
  NODE_ENV?: 'production' | 'development'
  PORT?: string
  EXTERNAL_URL?: string
  INTERNAL_PASSWORD?: string
  ENCRYPTION_KEY?: string
  DATABASE_URL?: string
  DATABASE_POOL?: string
  CLUSTER_ENABLED?: string
  REDIS_URL?: string
  REDIS_OPTIONS?: string
  REDIS_SCOPE?: string
  LOGGING_ENABLED?: string
  SYNC?: string
  SKIP_LOAD_CONFIG?: string
  SKIP_LOAD_ENV?: string
  SPINNED?: string
  SPINNED_URL?: string
  NO_LAZY_LOADING?: string
  BATCHING_ENABLED?: string
  NO_LOGO?: string
  SINGLE_LINE_LOGGING?: string
  APM_ENABLED?: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends MessagingEnv {}
  }
}
