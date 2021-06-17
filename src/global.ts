export interface MessagingEnv {
  PORT?: string
  NODE_ENV?: 'production'
  DATABASE_URL?: string
  REDIS_URL?: string
  REDIS_OPTIONS?: string
  ENCRYPTION_KEY?: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends MessagingEnv {}
  }
}
