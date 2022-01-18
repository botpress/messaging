export interface EngineEnv {
  NODE_ENV?: 'production' | 'development'

  // logger
  LOGGING_ENABLED?: string
  SUPPRESS_LOGGING?: string
  SINGLE_LINE_LOGGING?: string
  DISABLE_LOGGING_TIMESTAMP?: string

  // database
  DATABASE_URL?: string
  DATABASE_POOL?: string
  DATABASE_SUFFIX?: string
  DATABASE_TRANSIENT?: string

  // migration
  AUTO_MIGRATE?: string
  MIGRATE_TARGET?: string
  MIGRATE_CMD?: string
  MIGRATE_DRYRUN?: string
  TESTMIG_DB_VERSION?: string

  // crypto
  ENCRYPTION_KEY?: string

  // distributed
  CLUSTER_ENABLED?: string
  REDIS_URL?: string
  REDIS_OPTIONS?: string
  REDIS_SCOPE?: string

  // batching
  BATCHING_ENABLED?: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EngineEnv {}
  }
}
