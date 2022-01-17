import { uuid } from '@botpress/messaging-base'
import { AxiosRequestConfig } from 'axios'
import { MessagingClientAuth } from './auth'

export interface MessagingChannelOptions {
  /** Base url of the messaging server */
  url: string
  /** A custom axios config giving more control over the HTTP client used internally. Optional */
  config?: Omit<AxiosRequestConfig, 'baseURL'>
}

export interface MessagingOptions extends MessagingChannelOptions, MessagingClientAuth {
  /** Messaging client id */
  clientId: uuid
}
