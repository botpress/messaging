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
  SYNC?: string
  SKIP_LOAD_CONFIG?: string
  SKIP_LOAD_ENV?: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends MessagingEnv {}
  }
}
