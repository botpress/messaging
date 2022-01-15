import { AxiosRequestConfig } from 'axios'
import { MessagingClientCredentials } from './auth'

export interface MessagingChannelOptions {
  /** Base url of the messaging server */
  url: string
  /** A custom axios config giving more control over the HTTP client used internally. Optional */
  config?: Omit<AxiosRequestConfig, 'baseURL'>
}

export interface MessagingOptions extends MessagingChannelOptions {
  /** Client credentials to access client owned resources */
  creds: MessagingClientCredentials
}
