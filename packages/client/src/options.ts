import { uuid } from '@botpress/messaging-base'
import { AxiosRequestConfig } from 'axios'
import { MessagingClientAuth } from './auth'
import { Logger } from './logger'

export interface MessagingChannelOptions {
  /** Base url of the messaging server */
  url: string
  /** Key to access admin routes. Optional */
  adminKey?: string
  /** A custom axios config giving more control over the HTTP client used internally. Optional */
  axios?: Omit<AxiosRequestConfig, 'baseURL'>
  /** Optional logger interface that can be used to get better debugging */
  logger?: Logger
  /** Name of the cookie for sticky sessions */
  sessionCookieName?: string
}

export interface MessagingOptions extends Omit<MessagingChannelOptions, 'adminKey'>, MessagingClientAuth {
  /** Messaging client id */
  clientId: uuid
}
