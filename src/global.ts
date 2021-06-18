export interface MessagingEnv {
  PORT?: string
  NODE_ENV?: 'production' | 'development'
  DATABASE_URL?: string
  CLUSTER_ENABLED?: string
  REDIS_URL?: string
  REDIS_OPTIONS?: string
  ENCRYPTION_KEY?: string
  SKIP_LOAD_CONFIG?: string
  SKIP_LOAD_ENV?: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends MessagingEnv {}
  }
}
