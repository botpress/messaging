import { uuid } from '@botpress/messaging-base'
import { AxiosRequestConfig } from 'axios'
import { MessagingClientAuth } from './auth'

export interface MessagingChannelOptions {
  /** Base url of the messaging server */
  url: string
  /** Key to access admin routes. Optional */
  adminKey?: string
  /** A custom axios config giving more control over the HTTP client used internally. Optional */
  axios?: Omit<AxiosRequestConfig, 'baseURL'>
}

export interface MessagingOptions extends Omit<MessagingChannelOptions, 'adminKey'>, MessagingClientAuth {
  /** Messaging client id */
  clientId: uuid
}
